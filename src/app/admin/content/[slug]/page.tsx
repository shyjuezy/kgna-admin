import Link from "next/link";
import { DEFAULT_ABOUT_CONTENT, type CmsPageContent } from "@/lib/content";
import { getEditablePage } from "@/lib/repository";

type SectionProps = Record<string, unknown>;

function getSection(content: CmsPageContent, type: string): SectionProps {
  return (content.sections.find((section) => section.type === type)?.props ?? {}) as SectionProps;
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

function TextField({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      <input
        name={name}
        defaultValue={value}
        className="rounded border border-slate-300 px-3 py-2 font-normal text-slate-900"
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  value,
  rows = 3,
}: {
  label: string;
  name: string;
  value: string;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      <textarea
        name={name}
        defaultValue={value}
        rows={rows}
        className="rounded border border-slate-300 px-3 py-2 font-normal text-slate-900"
      />
    </label>
  );
}

function fieldLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

function GenericStructuredEditor({ content }: { content: CmsPageContent }) {
  return (
    <div className="space-y-6">
      <input type="hidden" name="editorType" value="generic-structured" />
      {content.sections.map((section, sectionIndex) => (
        <fieldset key={`${section.type}-${sectionIndex}`} className="rounded border border-slate-200 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-900">
            {fieldLabel(section.type)}
          </legend>
          <input name={`section.${sectionIndex}.type`} type="hidden" value={section.type} />
          <div className="mt-3 grid gap-4">
            {Object.entries(section.props).map(([key, value]) => {
              if (Array.isArray(value)) {
                return (
                  <div key={key} className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">{fieldLabel(key)}</p>
                    {value.map((item, itemIndex) => (
                      <div key={`${key}-${itemIndex}`} className="grid gap-3 rounded bg-slate-50 p-3 md:grid-cols-2">
                        {Object.entries(item as SectionProps).map(([itemKey, itemValue]) => (
                          <TextAreaField
                            key={itemKey}
                            label={fieldLabel(itemKey)}
                            name={`section.${sectionIndex}.array.${key}.${itemIndex}.${itemKey}`}
                            value={asString(itemValue)}
                            rows={itemKey.toLowerCase().includes("description") || itemKey.toLowerCase().includes("body") ? 3 : 1}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
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
                  name={`section.${sectionIndex}.prop.${key}`}
                  value={asString(value)}
                  rows={3}
                />
              ) : (
                <TextField
                  key={key}
                  label={fieldLabel(key)}
                  name={`section.${sectionIndex}.prop.${key}`}
                  value={asString(value)}
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
        <legend className="px-1 text-sm font-semibold text-slate-900">Hero</legend>
        <div className="mt-3 grid gap-4">
          <TextField label="Heading" name="hero.heading" value={asString(hero.heading)} />
          <TextAreaField label="Body" name="hero.body" value={asString(hero.body)} />
        </div>
      </fieldset>

      <fieldset className="rounded border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-900">Mission and Vision</legend>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <TextField label="Mission title" name="mission.title" value={asString(missionVision.missionTitle)} />
          <TextField label="Vision title" name="vision.title" value={asString(missionVision.visionTitle)} />
          <TextAreaField label="Mission body" name="mission.body" value={asString(missionVision.missionBody)} rows={5} />
          <TextAreaField label="Vision body" name="vision.body" value={asString(missionVision.visionBody)} rows={5} />
        </div>
      </fieldset>

      <fieldset className="rounded border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-900">Core Values</legend>
        <div className="mt-3 space-y-4">
          <TextField label="Section heading" name="values.heading" value={asString(values.heading)} />
          {valueItems.map((item, index) => (
            <div key={index} className="grid gap-3 rounded bg-slate-50 p-3 md:grid-cols-2">
              <TextField label={`Value ${index + 1} title`} name={`values.${index}.title`} value={asString(item.title)} />
              <TextAreaField label="Description" name={`values.${index}.description`} value={asString(item.description)} />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-900">Journey Timeline</legend>
        <div className="mt-3 space-y-4">
          <TextField label="Section heading" name="journey.heading" value={asString(journey.heading)} />
          {journeyItems.map((item, index) => (
            <div key={index} className="grid gap-3 rounded bg-slate-50 p-3 md:grid-cols-[120px_1fr]">
              <TextField label="Year" name={`journey.${index}.year`} value={asString(item.year)} />
              <div className="grid gap-3">
                <TextField label="Title" name={`journey.${index}.title`} value={asString(item.title)} />
                <TextAreaField label="Description" name={`journey.${index}.description`} value={asString(item.description)} />
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-900">Leadership</legend>
        <div className="mt-3 space-y-4">
          <TextField label="Section heading" name="leadership.heading" value={asString(leadership.heading)} />
          <TextAreaField label="Section body" name="leadership.body" value={asString(leadership.body)} />
          {members.map((member, index) => (
            <div key={index} className="grid gap-3 rounded bg-slate-50 p-3 md:grid-cols-2">
              <TextField label={`Member ${index + 1} name`} name={`members.${index}.name`} value={asString(member.name)} />
              <TextField label="Role" name={`members.${index}.role`} value={asString(member.role)} />
              <TextAreaField label="Bio" name={`members.${index}.bio`} value={asString(member.bio)} />
              <TextField label="Image URL" name={`members.${index}.imageUrl`} value={asString(member.imageUrl)} />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-900">Get Involved</legend>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <TextField label="Heading" name="cta.heading" value={asString(cta.heading)} />
          <TextAreaField label="Body" name="cta.body" value={asString(cta.body)} />
          <TextField label="Primary button label" name="cta.primaryLabel" value={asString(cta.primaryLabel)} />
          <TextField label="Primary button link" name="cta.primaryHref" value={asString(cta.primaryHref)} />
          <TextField label="Secondary button label" name="cta.secondaryLabel" value={asString(cta.secondaryLabel)} />
          <TextField label="Secondary button link" name="cta.secondaryHref" value={asString(cta.secondaryHref)} />
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
        <h1 className="text-lg font-semibold text-amber-800">Database not configured</h1>
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
        <Link className="mt-4 inline-block text-sm text-slate-700 underline" href="/admin">
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

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{page.title}</h1>
          <p className="text-sm text-slate-600">
            Slug: <span className="font-mono">{page.slug}</span>
          </p>
        </div>
        <Link className="text-sm text-slate-700 underline" href="/admin">
          Back
        </Link>
      </div>

      {success && <p className="mt-4 text-sm text-green-700">{success}</p>}

      <form
        action={`/api/admin/pages/${page.slug}`}
        method="post"
        className="mt-5 space-y-4"
      >
        <input
          type="hidden"
          name="slug"
          value={page.slug}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={page.draftContent.title}
            className="rounded border border-slate-300 px-3 py-2"
          />
        </div>
        {page.slug === "about" ? (
          <AboutStructuredEditor content={page.draftContent} />
        ) : page.draftContent.sections.length > 0 ? (
          <GenericStructuredEditor content={page.draftContent} />
        ) : (
          <div className="flex flex-col gap-1">
            <label htmlFor="content" className="text-sm font-medium text-slate-700">
              Draft content JSON
            </label>
            <textarea
              id="content"
              name="content"
              defaultValue={JSON.stringify(page.draftContent, null, 2)}
              rows={20}
              className="font-mono rounded border border-slate-300 bg-slate-50 px-3 py-2"
            />
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <button className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Save Draft
          </button>
        </div>
      </form>

      <div className="mt-5 flex flex-wrap gap-3">
        <form action={`/api/admin/pages/${page.slug}/publish`} method="post">
          <button className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
            Publish
          </button>
        </form>
        <a
          className="rounded bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
          href={`/api/public/pages/${page.slug}`}
        >
          View Public JSON
        </a>
      </div>
    </section>
  );
}
