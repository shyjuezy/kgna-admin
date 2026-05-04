import Link from "next/link";
import { DEFAULT_ABOUT_CONTENT, type CmsPageContent } from "@/lib/content";
import { getEditablePage } from "@/lib/repository";
import { EventsStructuredEditor } from "@/components/admin/EventsStructuredEditor";
import { GalleryStructuredEditor } from "@/components/admin/GalleryStructuredEditor";
import { ContactStructuredEditor } from "@/components/admin/ContactStructuredEditor";
import { EditorFormShell } from "@/components/admin/EditorFormShell";
import { ImageUrlField } from "@/components/admin/ImageUrlField";
import { TextField, TextAreaField } from "@/components/admin/Fields";

function isImageFieldName(name: string): boolean {
  const leaf = name.split(".").pop()?.toLowerCase() ?? "";
  return /^(image|imageurl|imageurls|photo|photourl|thumbnail|thumb|cover|coverimage|avatar)$/.test(
    leaf,
  );
}

type SectionProps = Record<string, unknown>;

function getSection(content: CmsPageContent, type: string): SectionProps {
  return (content.sections.find((section) => section.type === type)?.props ??
    {}) as SectionProps;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asRecordArray(value: unknown) {
  return Array.isArray(value) ? (value as SectionProps[]) : [];
}

function getAboutContent(content: CmsPageContent) {
  if (content.sections.some((section) => section.type === "missionVision")) {
    return content;
  }

  return DEFAULT_ABOUT_CONTENT;
}

function fieldLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

function GenericStructuredEditor({
  content,
  slug,
}: {
  content: CmsPageContent;
  slug: string;
}) {
  const folder = `kgna/${slug}`;
  return (
    <div className="space-y-6">
      <input type="hidden" name="editorType" value="generic-structured" />
      {content.sections.map((section, sectionIndex) => (
        <fieldset
          key={`${section.type}-${sectionIndex}`}
          className="rounded border border-slate-200 p-4"
        >
          <legend className="px-1 text-sm font-semibold text-slate-900">
            {fieldLabel(section.type)}
          </legend>
          <input
            name={`section.${sectionIndex}.type`}
            type="hidden"
            value={section.type}
          />
          <div className="mt-3 grid gap-4">
            {Object.entries(section.props).map(([key, value]) => {
              if (Array.isArray(value)) {
                return (
                  <div key={key} className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">
                      {fieldLabel(key)}
                    </p>
                    {value.map((item, itemIndex) => (
                      <div
                        key={`${key}-${itemIndex}`}
                        className="grid gap-3 rounded bg-slate-50 p-3 md:grid-cols-2"
                      >
                        {Object.entries(item as SectionProps).map(
                          ([itemKey, itemValue]) => {
                            const fieldName = `section.${sectionIndex}.array.${key}.${itemIndex}.${itemKey}`;
                            if (isImageFieldName(itemKey)) {
                              return (
                                <ImageUrlField
                                  key={itemKey}
                                  label={fieldLabel(itemKey)}
                                  name={fieldName}
                                  defaultValue={asString(itemValue)}
                                  folder={folder}
                                  className="md:col-span-2"
                                />
                              );
                            }
                            return (
                              <TextAreaField
                                key={itemKey}
                                label={fieldLabel(itemKey)}
                                name={fieldName}
                                defaultValue={asString(itemValue)}
                                rows={
                                  itemKey
                                    .toLowerCase()
                                    .includes("description") ||
                                  itemKey.toLowerCase().includes("body")
                                    ? 3
                                    : 1
                                }
                              />
                            );
                          },
                        )}
                      </div>
                    ))}
                  </div>
                );
              }

              const fieldName = `section.${sectionIndex}.prop.${key}`;
              if (isImageFieldName(key)) {
                return (
                  <ImageUrlField
                    key={key}
                    label={fieldLabel(key)}
                    name={fieldName}
                    defaultValue={asString(value)}
                    folder={folder}
                  />
                );
              }

              const isLong =
                key.toLowerCase().includes("body") ||
                key.toLowerCase().includes("description") ||
                asString(value).length > 80;

              return isLong ? (
                <TextAreaField
                  key={key}
                  label={fieldLabel(key)}
                  name={fieldName}
                  defaultValue={asString(value)}
                  rows={3}
                />
              ) : (
                <TextField
                  key={key}
                  label={fieldLabel(key)}
                  name={fieldName}
                  defaultValue={asString(value)}
                />
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

function AboutStructuredEditor({ content }: { content: CmsPageContent }) {
  const aboutContent = getAboutContent(content);
  const hero = getSection(aboutContent, "hero");
  const missionVision = getSection(aboutContent, "missionVision");
  const values = getSection(aboutContent, "values");
  const journey = getSection(aboutContent, "journey");
  const leadership = getSection(aboutContent, "leadership");
  const cta = getSection(aboutContent, "cta");
  const valueItems = asRecordArray(values.items);
  const journeyItems = asRecordArray(journey.items);
  const members = asRecordArray(leadership.members);

  return (
    <div className="space-y-6">
      <input type="hidden" name="editorType" value="about-structured" />

      <fieldset className="rounded border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-900">
          Hero
        </legend>
        <div className="mt-3 grid gap-4">
          <TextField
            label="Heading"
            name="hero.heading"
            defaultValue={asString(hero.heading)}
          />
          <TextAreaField
            label="Body"
            name="hero.body"
            defaultValue={asString(hero.body)}
          />
        </div>
      </fieldset>

      <fieldset className="rounded border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-900">
          Mission and Vision
        </legend>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <TextField
            label="Mission title"
            name="mission.title"
            defaultValue={asString(missionVision.missionTitle)}
          />
          <TextField
            label="Vision title"
            name="vision.title"
            defaultValue={asString(missionVision.visionTitle)}
          />
          <TextAreaField
            label="Mission body"
            name="mission.body"
            defaultValue={asString(missionVision.missionBody)}
            rows={5}
          />
          <TextAreaField
            label="Vision body"
            name="vision.body"
            defaultValue={asString(missionVision.visionBody)}
            rows={5}
          />
        </div>
      </fieldset>

      <fieldset className="rounded border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-900">
          Core Values
        </legend>
        <div className="mt-3 space-y-4">
          <TextField
            label="Section heading"
            name="values.heading"
            defaultValue={asString(values.heading)}
          />
          {valueItems.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 rounded bg-slate-50 p-3 md:grid-cols-2"
            >
              <TextField
                label={`Value ${index + 1} title`}
                name={`values.${index}.title`}
                defaultValue={asString(item.title)}
              />
              <TextAreaField
                label="Description"
                name={`values.${index}.description`}
                defaultValue={asString(item.description)}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-900">
          Journey Timeline
        </legend>
        <div className="mt-3 space-y-4">
          <TextField
            label="Section heading"
            name="journey.heading"
            defaultValue={asString(journey.heading)}
          />
          {journeyItems.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 rounded bg-slate-50 p-3 md:grid-cols-[120px_1fr]"
            >
              <TextField
                label="Year"
                name={`journey.${index}.year`}
                defaultValue={asString(item.year)}
              />
              <div className="grid gap-3">
                <TextField
                  label="Title"
                  name={`journey.${index}.title`}
                  defaultValue={asString(item.title)}
                />
                <TextAreaField
                  label="Description"
                  name={`journey.${index}.description`}
                  defaultValue={asString(item.description)}
                />
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-900">
          Leadership
        </legend>
        <div className="mt-3 space-y-4">
          <TextField
            label="Section heading"
            name="leadership.heading"
            defaultValue={asString(leadership.heading)}
          />
          <TextAreaField
            label="Section body"
            name="leadership.body"
            defaultValue={asString(leadership.body)}
          />
          {members.map((member, index) => (
            <div
              key={index}
              className="grid gap-3 rounded bg-slate-50 p-3 md:grid-cols-2"
            >
              <TextField
                label={`Member ${index + 1} name`}
                name={`members.${index}.name`}
                defaultValue={asString(member.name)}
              />
              <TextField
                label="Role"
                name={`members.${index}.role`}
                defaultValue={asString(member.role)}
              />
              <TextAreaField
                label="Bio"
                name={`members.${index}.bio`}
                defaultValue={asString(member.bio)}
              />
              <ImageUrlField
                label="Image URL"
                name={`members.${index}.imageUrl`}
                defaultValue={asString(member.imageUrl)}
                folder="kgna/leadership"
              />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-900">
          Get Involved
        </legend>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <TextField
            label="Heading"
            name="cta.heading"
            defaultValue={asString(cta.heading)}
          />
          <TextAreaField
            label="Body"
            name="cta.body"
            defaultValue={asString(cta.body)}
          />
          <TextField
            label="Primary button label"
            name="cta.primaryLabel"
            defaultValue={asString(cta.primaryLabel)}
          />
          <TextField
            label="Primary button link"
            name="cta.primaryHref"
            defaultValue={asString(cta.primaryHref)}
          />
          <TextField
            label="Secondary button label"
            name="cta.secondaryLabel"
            defaultValue={asString(cta.secondaryLabel)}
          />
          <TextField
            label="Secondary button link"
            name="cta.secondaryHref"
            defaultValue={asString(cta.secondaryHref)}
          />
        </div>
      </fieldset>
    </div>
  );
}

export default async function EditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; published?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  let page;
  try {
    page = await getEditablePage(slug);
  } catch {
    return (
      <main className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-lg font-semibold text-amber-800">
          Database not configured
        </h1>
        <p className="mt-2 text-sm text-amber-900">
          Add DATABASE_URL in environment variables and run migrations.
        </p>
      </main>
    );
  }

  if (!page) {
    return (
      <main className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-lg font-semibold">Page not found</h1>
        <Link
          className="mt-4 inline-block text-sm text-slate-700 underline"
          href="/admin"
        >
          Back to dashboard
        </Link>
      </main>
    );
  }

  const success =
    query.saved === "1"
      ? "Draft saved."
      : query.published === "1"
        ? "Draft published."
        : "";

  const isPublished = page.status === "published";
  const hasUnpublishedChanges =
    !page.publishedContent ||
    JSON.stringify(page.draftContent) !== JSON.stringify(page.publishedContent);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 3 5 8l5 5" />
            </svg>
            Back to pages
          </Link>
          <h1 className="mt-1 truncate text-xl font-semibold tracking-tight text-slate-900">
            {page.title}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono">/{page.slug}</span>
            <span className="text-slate-300">·</span>
            <span
              className={
                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium " +
                (isPublished
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-slate-200 bg-slate-50 text-slate-600")
              }
            >
              <span
                className={
                  "h-1.5 w-1.5 rounded-full " +
                  (isPublished ? "bg-emerald-500" : "bg-slate-400")
                }
              />
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>
        </div>
        <form
          action={`/api/admin/pages/${page.slug}/publish`}
          method="post"
          className="shrink-0"
        >
          <button
            type="submit"
            disabled={!hasUnpublishedChanges}
            title={
              hasUnpublishedChanges
                ? "Publish saved changes to the live site"
                : "No changes to publish"
            }
            className={
              "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition " +
              (hasUnpublishedChanges
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400")
            }
          >
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8l3 3 7-7" />
            </svg>
            {hasUnpublishedChanges
              ? isPublished
                ? "Publish changes"
                : "Publish"
              : "Up to date"}
          </button>
        </form>
      </div>

      {success && (
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {success}
        </p>
      )}

      <div className="mt-6">
        <EditorFormShell action={`/api/admin/pages/${page.slug}`}>
          <input type="hidden" name="slug" value={page.slug} />
          <div className="flex flex-col gap-1">
            <label
              htmlFor="title"
              className="text-sm font-medium text-slate-700"
            >
              Title
            </label>
            <input
              id="title"
              name="title"
              defaultValue={page.draftContent.title}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          {page.slug === "about" ? (
            <AboutStructuredEditor content={page.draftContent} />
          ) : page.slug === "events" ? (
            <EventsStructuredEditor content={page.draftContent} />
          ) : page.slug === "gallery" ? (
            <GalleryStructuredEditor content={page.draftContent} />
          ) : page.slug === "contact" ? (
            <ContactStructuredEditor content={page.draftContent} />
          ) : page.draftContent.sections.length > 0 ? (
            <GenericStructuredEditor
              content={page.draftContent}
              slug={page.slug}
            />
          ) : (
            <div className="flex flex-col gap-1">
              <label
                htmlFor="content"
                className="text-sm font-medium text-slate-700"
              >
                Draft content JSON
              </label>
              <textarea
                id="content"
                name="content"
                defaultValue={JSON.stringify(page.draftContent, null, 2)}
                rows={20}
                className="font-mono rounded-md border border-slate-300 bg-slate-50 px-3 py-2"
              />
            </div>
          )}
        </EditorFormShell>
      </div>
    </section>
  );
}
