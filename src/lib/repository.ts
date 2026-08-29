import { and, eq } from "drizzle-orm";
import { pages } from "@/lib/db/schema";
import { getDb, isDatabaseConfigured } from "@/lib/db/index";
import { DEFAULT_PAGES, cmsPageContentSchema, type CmsPageContent } from "@/lib/content";

export type CmsPageRecord = {
  slug: string;
  title: string;
  status: "draft" | "published";
  draftContent: CmsPageContent;
  publishedContent: CmsPageContent | null;
  publishedAt: string | null;
  updatedAt: string;
};

type DbPage = {
  slug: string;
  title: string;
  status: string;
  draftContent: unknown;
  publishedContent: unknown;
  publishedAt: Date | null;
  updatedAt: Date;
};

const ALLOWED_STATUS = new Set<string>(["draft", "published"]);

function normalizeStatus(status: string): "draft" | "published" {
  return ALLOWED_STATUS.has(status) ? (status as "draft" | "published") : "draft";
}

function parseContent(value: unknown): CmsPageContent {
  return cmsPageContentSchema.parse(value);
}

function toCmsPageRecord(row: DbPage): CmsPageRecord {
  const draftContent = parseContent(row.draftContent);
  const publishedContent = row.publishedContent
    ? parseContent(row.publishedContent)
    : null;

  return {
    slug: row.slug,
    title: row.title,
    status: normalizeStatus(row.status),
    draftContent,
    publishedContent,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function seedDefaults() {
  const db = getDb();
  const existingRows = await db.select({ slug: pages.slug }).from(pages);
  const existing = new Set(existingRows.map((row) => row.slug));

  const missingPages = DEFAULT_PAGES.filter((page) => !existing.has(page.slug)).map((page) => ({
    slug: page.slug,
    title: page.title,
    status: "draft" as const,
    draftContent: page.draftContent,
  }));

  if (missingPages.length > 0) {
    await db.insert(pages).values(missingPages);
  }
}

/**
 * Sections added to DEFAULT_PAGES after a row was first seeded never reach an
 * editor: seedDefaults() only inserts pages that are missing entirely, and the
 * admin UI has no "add section" control - GenericStructuredEditor renders a
 * fieldset per section already present in draftContent. So the donate page's
 * directGiving block (Zelle handle, PayPal link), added in 666e608, is
 * invisible and uneditable on any database seeded before that commit.
 *
 * Append the defaults a row is missing, at the position they hold in the
 * defaults, and leave every existing section untouched - this only ever adds.
 * Removing a section is not something the UI can do, so a type that is absent
 * is a gap rather than a deliberate deletion.
 *
 * publishedContent is deliberately left alone: getPublishedPage() serves
 * publishedContent ?? draftContent, so a backfilled section reaches the public
 * site only once someone reviews it and hits Publish.
 */
async function backfillMissingSections() {
  const db = getDb();
  const rows = await db.select().from(pages).execute();

  for (const row of rows as DbPage[]) {
    const defaults = DEFAULT_PAGES.find((page) => page.slug === row.slug);
    if (!defaults) continue;

    let draft: CmsPageContent;
    try {
      draft = parseContent(row.draftContent);
    } catch {
      // Hand-edited or older content we cannot read: leave it for a human
      // rather than overwriting it with defaults.
      continue;
    }

    const present = new Set(draft.sections.map((section) => section.type));
    const sections = [...draft.sections];
    let added = false;

    defaults.draftContent.sections.forEach((section, index) => {
      if (present.has(section.type)) return;
      sections.splice(Math.min(index, sections.length), 0, section);
      added = true;
    });

    if (!added) continue;

    await db
      .update(pages)
      .set({ draftContent: { ...draft, sections } })
      .where(eq(pages.slug, row.slug));
  }
}

function ensureDbAccess() {
  if (!isDatabaseConfigured) {
    throw new Error("DATABASE_URL is not configured");
  }
}

export async function listEditablePages(): Promise<CmsPageRecord[]> {
  ensureDbAccess();
  const db = getDb();
  await seedDefaults();
  await backfillMissingSections();

  const rows = await db
    .select()
    .from(pages)
    .orderBy(pages.slug)
    .execute();

  return rows.map((row) => toCmsPageRecord(row as DbPage));
}

export async function getEditablePage(slug: string): Promise<CmsPageRecord | null> {
  ensureDbAccess();
  const db = getDb();
  await seedDefaults();
  await backfillMissingSections();

  const rows = await db.select().from(pages).where(and(eq(pages.slug, slug))).limit(1);
  if (rows.length === 0) {
    return null;
  }

  return toCmsPageRecord(rows[0] as DbPage);
}

export async function upsertDraftPage(
  slug: string,
  title: string,
  content: CmsPageContent,
): Promise<CmsPageRecord> {
  ensureDbAccess();
  const db = getDb();
  await db
    .insert(pages)
    .values({
      slug,
      title,
      status: "draft",
      draftContent: content,
    })
    .onConflictDoUpdate({
      target: pages.slug,
      set: {
        title,
        status: "draft",
        draftContent: content,
      },
    });

  return (await getEditablePage(slug)) as CmsPageRecord;
}

export async function publishPage(slug: string): Promise<CmsPageRecord | null> {
  ensureDbAccess();
  const db = getDb();
  const page = await getEditablePage(slug);
  if (!page) {
    return null;
  }

  await db
    .update(pages)
    .set({
      status: "published",
      publishedContent: page.draftContent,
      publishedAt: new Date(),
    })
    .where(eq(pages.slug, slug));

  return getEditablePage(slug);
}

export async function getPublicPage(slug: string): Promise<{
  slug: string;
  title: string;
  content: CmsPageContent;
  status: "draft" | "published";
  publishedAt: string | null;
} | null> {
  const page = await getEditablePage(slug);
  if (!page) {
    return null;
  }

  const content = page.publishedContent ?? page.draftContent;
  return {
    slug: page.slug,
    title: page.title,
    content,
    status: page.status,
    publishedAt: page.publishedAt,
  };
}

export async function listPublicPages(): Promise<
  Array<{ slug: string; title: string; updatedAt: string; status: "draft" | "published" }>
> {
  const pages = await listEditablePages();

  return pages.map((page) => ({
    slug: page.slug,
    title: page.title,
    updatedAt: page.updatedAt,
    status: page.status,
  }));
}
