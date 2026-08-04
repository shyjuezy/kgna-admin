import { NextRequest, NextResponse } from "next/server";
import { cmsPageContentSchema, type CmsPageContent } from "@/lib/content";
import { getAdminAuthState } from "@/lib/auth";
import { getEditablePage, upsertDraftPage } from "@/lib/repository";
import { buildGenericContent, formListItems } from "@/lib/generic-form";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await getAdminAuthState();
  if (auth.status !== "ok") {
    const status =
      auth.status === "not_configured"
        ? 503
        : auth.status === "not_authorized"
          ? 403
          : 401;
    return NextResponse.json(
      { error: "Unauthorized to access this page." },
      { status },
    );
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
      fields.map((field) => [
        field,
        formValue(formData, `${prefix}.${index}.${field}`),
      ]),
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
          items: formItems(formData, "journey", 7, [
            "year",
            "title",
            "description",
          ]),
        },
      },
      {
        type: "leadership",
        props: {
          heading: formValue(formData, "leadership.heading"),
          body: formValue(formData, "leadership.body"),
          structure: formValue(formData, "leadership.structure"),
          // Variable-length: tiles can be added past the old 6-row cap, and
          // removing them all saves [] so the website renders no tiles.
          members: formListItems(formData, "members", [
            "role",
            "bio",
            "name",
            "imageUrl",
          ]),
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

function collectIndexedItems(
  formData: FormData,
  prefix: string,
  fields: string[],
): Record<string, string>[] {
  const dotPrefix = `${prefix}.`;
  const buckets = new Map<number, Record<string, string>>();

  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string" || !key.startsWith(dotPrefix)) {
      continue;
    }
    const rest = key.slice(dotPrefix.length);
    const dot = rest.indexOf(".");
    if (dot === -1) continue;
    const indexStr = rest.slice(0, dot);
    const field = rest.slice(dot + 1);
    const index = Number(indexStr);
    if (Number.isNaN(index) || !fields.includes(field)) continue;

    const current = buckets.get(index) ?? {};
    current[field] = value.trim();
    buckets.set(index, current);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, item]) => {
      const filled: Record<string, string> = {};
      for (const field of fields) {
        filled[field] = item[field] ?? "";
      }
      return filled;
    })
    .filter((item) =>
      Object.entries(item).some(
        ([field, value]) => field !== "id" && value.length > 0,
      ),
    );
}

function buildEventsContent(formData: FormData): CmsPageContent {
  const eventFields = [
    "id",
    "title",
    "description",
    "date",
    "time",
    "location",
    "category",
    "imageUrl",
    "registrationUrl",
  ];
  const upcoming = collectIndexedItems(
    formData,
    "events.upcoming",
    eventFields,
  );
  const past = collectIndexedItems(formData, "events.past", eventFields).map(
    ({ registrationUrl: _registrationUrl, ...rest }) => rest,
  );

  return {
    title: formValue(formData, "title") || "Events",
    sections: [
      {
        type: "hero",
        props: {
          heading: formValue(formData, "hero.heading"),
          body: formValue(formData, "hero.body"),
        },
      },
      {
        type: "events",
        props: {
          upcomingHeading:
            formValue(formData, "events.upcomingHeading") || "Upcoming Events",
          pastHeading:
            formValue(formData, "events.pastHeading") || "Past Events",
          upcoming,
          past,
        },
      },
      {
        type: "newsletter",
        props: {
          heading: formValue(formData, "newsletter.heading"),
          body: formValue(formData, "newsletter.body"),
          buttonLabel: formValue(formData, "newsletter.buttonLabel"),
          buttonHref: formValue(formData, "newsletter.buttonHref"),
        },
      },
    ],
  };
}

function buildContactContent(formData: FormData): CmsPageContent {
  const links = collectIndexedItems(formData, "social.links", [
    "label",
    "href",
  ]);
  const faqItems = collectIndexedItems(formData, "faq.items", [
    "question",
    "answer",
  ]);

  return {
    title: formValue(formData, "title") || "Contact",
    sections: [
      {
        type: "hero",
        props: {
          heading: formValue(formData, "hero.heading"),
          body: formValue(formData, "hero.body"),
        },
      },
      {
        type: "contactInfo",
        props: {
          heading: formValue(formData, "contactInfo.heading"),
          email: formValue(formData, "contactInfo.email"),
        },
      },
      {
        type: "form",
        props: {
          heading: formValue(formData, "form.heading"),
          body: formValue(formData, "form.body"),
        },
      },
      {
        type: "social",
        props: {
          heading: formValue(formData, "social.heading") || "Follow Us",
          body: formValue(formData, "social.body"),
          links,
        },
      },
      {
        type: "faq",
        props: {
          heading:
            formValue(formData, "faq.heading") || "Frequently Asked Questions",
          body: formValue(formData, "faq.body"),
          items: faqItems,
        },
      },
    ],
  };
}

function buildGalleryContent(formData: FormData): CmsPageContent {
  const items = collectIndexedItems(formData, "gallery.items", [
    "id",
    "title",
    "description",
    "image",
    "category",
    "date",
    "location",
    "featured",
  ]);

  return {
    title: formValue(formData, "title") || "Gallery",
    sections: [
      {
        type: "hero",
        props: {
          heading: formValue(formData, "hero.heading"),
          body: formValue(formData, "hero.body"),
        },
      },
      {
        type: "gallery",
        props: {
          featuredHeading:
            formValue(formData, "gallery.featuredHeading") || "Featured Photos",
          ctaHeading:
            formValue(formData, "gallery.ctaHeading") || "Share Your Memories",
          ctaBody: formValue(formData, "gallery.ctaBody"),
          items,
        },
      },
    ],
  };
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await getAdminAuthState();
  if (auth.status !== "ok") {
    const status =
      auth.status === "not_configured"
        ? 503
        : auth.status === "not_authorized"
          ? 403
          : 401;
    return NextResponse.json(
      { error: "Unauthorized to access this page." },
      { status },
    );
  }

  const { slug } = await context.params;
  const formData = await request.formData();
  const title = ((formData.get("title") as string) ?? "").trim();
  const editorType = formData.get("editorType");

  if (editorType === "about-structured") {
    const content = buildAboutContent(formData);
    await upsertDraftPage(
      slug,
      content.title,
      cmsPageContentSchema.parse(content),
    );
    return NextResponse.redirect(
      new URL(`/admin/content/${slug}?saved=1`, request.url),
      { status: 303 },
    );
  }

  if (editorType === "events-structured") {
    const content = buildEventsContent(formData);
    await upsertDraftPage(
      slug,
      content.title,
      cmsPageContentSchema.parse(content),
    );
    return NextResponse.redirect(
      new URL(`/admin/content/${slug}?saved=1`, request.url),
      { status: 303 },
    );
  }

  if (editorType === "contact-structured") {
    const content = buildContactContent(formData);
    await upsertDraftPage(
      slug,
      content.title,
      cmsPageContentSchema.parse(content),
    );
    return NextResponse.redirect(
      new URL(`/admin/content/${slug}?saved=1`, request.url),
      { status: 303 },
    );
  }

  if (editorType === "gallery-structured") {
    const content = buildGalleryContent(formData);
    await upsertDraftPage(
      slug,
      content.title,
      cmsPageContentSchema.parse(content),
    );
    return NextResponse.redirect(
      new URL(`/admin/content/${slug}?saved=1`, request.url),
      { status: 303 },
    );
  }

  if (editorType === "generic-structured") {
    const content = buildGenericContent(formData);
    await upsertDraftPage(
      slug,
      content.title,
      cmsPageContentSchema.parse(content),
    );
    return NextResponse.redirect(
      new URL(`/admin/content/${slug}?saved=1`, request.url),
      { status: 303 },
    );
  }

  const contentRaw = (formData.get("content") as string) ?? "{}";

  let parsed: unknown;
  try {
    parsed = JSON.parse(contentRaw);
  } catch {
    return NextResponse.json(
      { error: "content must be valid JSON." },
      { status: 400 },
    );
  }

  const parsedTitle =
    typeof title === "string" && title.length > 0 ? title : "";
  const normalized = {
    ...cmsPageContentSchema.parse(parsed),
    ...(parsedTitle ? { title: parsedTitle } : {}),
  };

  await upsertDraftPage(slug, normalized.title, normalized);
  return NextResponse.redirect(
    new URL(`/admin/content/${slug}?saved=1`, request.url),
    { status: 303 },
  );
}
