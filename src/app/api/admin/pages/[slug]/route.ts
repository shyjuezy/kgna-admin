import { NextRequest, NextResponse } from "next/server";
import { cmsPageContentSchema, type CmsPageContent } from "@/lib/content";
import { getAdminAuthState } from "@/lib/auth";
import { getEditablePage, upsertDraftPage } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await getAdminAuthState();
  if (auth.status !== "ok") {
    const status = auth.status === "not_configured" ? 503 : auth.status === "not_authorized" ? 403 : 401;
    return NextResponse.json({ error: "Unauthorized to access this page." }, { status });
  }

  const { slug } = await context.params;
  const page = await getEditablePage(slug);
  if (!page) {
    return NextResponse.json({ error: "Page not found." }, { status: 404 });
  }

  return NextResponse.json(page);
}

function formValue(formData: FormData, name: string) {
  return ((formData.get(name) as string | null) ?? "").trim();
}

function formItems(
  formData: FormData,
  prefix: string,
  length: number,
  fields: string[],
) {
  return Array.from({ length }, (_, index) =>
    Object.fromEntries(
      fields.map((field) => [field, formValue(formData, `${prefix}.${index}.${field}`)]),
    ),
  ).filter((item) => Object.values(item).some(Boolean));
}

function buildAboutContent(formData: FormData): CmsPageContent {
  return {
    title: formValue(formData, "title") || "About",
    sections: [
      {
        type: "hero",
        props: {
          heading: formValue(formData, "hero.heading"),
          body: formValue(formData, "hero.body"),
        },
      },
      {
        type: "missionVision",
        props: {
          missionTitle: formValue(formData, "mission.title"),
          missionBody: formValue(formData, "mission.body"),
          visionTitle: formValue(formData, "vision.title"),
          visionBody: formValue(formData, "vision.body"),
        },
      },
      {
        type: "values",
        props: {
          heading: formValue(formData, "values.heading"),
          items: formItems(formData, "values", 4, ["title", "description"]),
        },
      },
      {
        type: "journey",
        props: {
          heading: formValue(formData, "journey.heading"),
          items: formItems(formData, "journey", 7, ["year", "title", "description"]),
        },
      },
      {
        type: "leadership",
        props: {
          heading: formValue(formData, "leadership.heading"),
          body: formValue(formData, "leadership.body"),
          members: formItems(formData, "members", 6, ["name", "role", "bio", "imageUrl"]),
        },
      },
      {
        type: "cta",
        props: {
          heading: formValue(formData, "cta.heading"),
          body: formValue(formData, "cta.body"),
          primaryLabel: formValue(formData, "cta.primaryLabel"),
          primaryHref: formValue(formData, "cta.primaryHref"),
          secondaryLabel: formValue(formData, "cta.secondaryLabel"),
          secondaryHref: formValue(formData, "cta.secondaryHref"),
        },
      },
    ],
  };
}

function buildGenericContent(formData: FormData): CmsPageContent {
  const sections: CmsPageContent["sections"] = [];

  for (let sectionIndex = 0; ; sectionIndex += 1) {
    const type = formValue(formData, `section.${sectionIndex}.type`);
    if (!type) {
      break;
    }

    const props: Record<string, unknown> = {};
    const propPrefix = `section.${sectionIndex}.prop.`;
    const arrayPrefix = `section.${sectionIndex}.array.`;
    const arrays = new Map<string, Array<Record<string, string>>>();

    for (const [key, value] of formData.entries()) {
      if (typeof value !== "string") {
        continue;
      }

      if (key.startsWith(propPrefix)) {
        props[key.slice(propPrefix.length)] = value.trim();
      }

      if (key.startsWith(arrayPrefix)) {
        const rest = key.slice(arrayPrefix.length);
        const [arrayName, rawIndex, fieldName] = rest.split(".");
        const itemIndex = Number(rawIndex);

        if (!arrayName || !fieldName || Number.isNaN(itemIndex)) {
          continue;
        }

        const current = arrays.get(arrayName) ?? [];
        current[itemIndex] = {
          ...(current[itemIndex] ?? {}),
          [fieldName]: value.trim(),
        };
        arrays.set(arrayName, current);
      }
    }

    for (const [arrayName, items] of arrays.entries()) {
      props[arrayName] = items.filter((item) => Object.values(item).some(Boolean));
    }

    sections.push({ type, props });
  }

  return {
    title: formValue(formData, "title") || "Untitled",
    sections,
  };
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const auth = await getAdminAuthState();
  if (auth.status !== "ok") {
    const status = auth.status === "not_configured" ? 503 : auth.status === "not_authorized" ? 403 : 401;
    return NextResponse.json({ error: "Unauthorized to access this page." }, { status });
  }

  const { slug } = await context.params;
  const formData = await request.formData();
  const title = ((formData.get("title") as string) ?? "").trim();
  const editorType = formData.get("editorType");

  if (editorType === "about-structured") {
    const content = buildAboutContent(formData);
    await upsertDraftPage(slug, content.title, cmsPageContentSchema.parse(content));
    return NextResponse.redirect(new URL(`/admin/content/${slug}?saved=1`, request.url), { status: 303 });
  }

  if (editorType === "generic-structured") {
    const content = buildGenericContent(formData);
    await upsertDraftPage(slug, content.title, cmsPageContentSchema.parse(content));
    return NextResponse.redirect(new URL(`/admin/content/${slug}?saved=1`, request.url), { status: 303 });
  }

  const contentRaw = (formData.get("content") as string) ?? "{}";

  let parsed: unknown;
  try {
    parsed = JSON.parse(contentRaw);
  } catch {
    return NextResponse.json({ error: "content must be valid JSON." }, { status: 400 });
  }

  const parsedTitle = typeof title === "string" && title.length > 0 ? title : "";
  const normalized = {
    ...cmsPageContentSchema.parse(parsed),
    ...(parsedTitle ? { title: parsedTitle } : {}),
  };

  await upsertDraftPage(slug, normalized.title, normalized);
  return NextResponse.redirect(new URL(`/admin/content/${slug}?saved=1`, request.url), { status: 303 });
}
