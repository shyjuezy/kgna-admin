"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CmsPageContent } from "@/lib/content";
import { useMarkDirty } from "@/components/admin/EditorFormShell";
import { TextField, TextAreaField } from "@/components/admin/Fields";

type SectionProps = Record<string, unknown>;

type SocialLink = {
  id: string;
  platform: string;
  label: string;
  href: string;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const PLATFORMS: { value: string; label: string; placeholder: string }[] = [
  {
    value: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/yourhandle",
  },
  {
    value: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/yourhandle",
  },
  {
    value: "twitter",
    label: "Twitter / X",
    placeholder: "https://twitter.com/yourhandle",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/yourhandle",
  },
  {
    value: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@yourhandle",
  },
  {
    value: "tiktok",
    label: "TikTok",
    placeholder: "https://tiktok.com/@yourhandle",
  },
  {
    value: "threads",
    label: "Threads",
    placeholder: "https://threads.net/@yourhandle",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    placeholder: "https://wa.me/your-number",
  },
  { value: "other", label: "Other", placeholder: "https://…" },
];

const PLATFORM_ALIASES: Record<string, string> = {
  facebook: "facebook",
  fb: "facebook",
  instagram: "instagram",
  ig: "instagram",
  twitter: "twitter",
  "twitter / x": "twitter",
  x: "twitter",
  linkedin: "linkedin",
  youtube: "youtube",
  yt: "youtube",
  tiktok: "tiktok",
  threads: "threads",
  whatsapp: "whatsapp",
  other: "other",
};
const KNOWN_LABELS = new Set(PLATFORMS.map((p) => p.label));

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asRecordArray(value: unknown): SectionProps[] {
  return Array.isArray(value) ? (value as SectionProps[]) : [];
}

function getSection(content: CmsPageContent, type: string): SectionProps {
  return (content.sections.find((section) => section.type === type)?.props ??
    {}) as SectionProps;
}

function cryptoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

function inferPlatform(label: string): string {
  return PLATFORM_ALIASES[label.trim().toLowerCase()] ?? "other";
}

function toSocialLink(raw: SectionProps, index: number): SocialLink {
  const label = asString(raw.label);
  return {
    id: `social-${index}`,
    platform: inferPlatform(label),
    label,
    href: asString(raw.href),
  };
}

function toFaqItem(raw: SectionProps, index: number): FaqItem {
  return {
    id: `faq-${index}`,
    question: asString(raw.question),
    answer: asString(raw.answer),
  };
}

function blankLink(): SocialLink {
  return {
    id: cryptoId(),
    platform: "facebook",
    label: "Facebook",
    href: "",
  };
}

function blankFaq(): FaqItem {
  return { id: cryptoId(), question: "", answer: "" };
}

export function ContactStructuredEditor({
  content,
}: {
  content: CmsPageContent;
}) {
  const hero = getSection(content, "hero");
  const contactInfo = getSection(content, "contactInfo");
  const form = getSection(content, "form");
  const social = getSection(content, "social");
  const faq = getSection(content, "faq");

  const [links, setLinks] = useState<SocialLink[]>(() =>
    asRecordArray(social.links).map(toSocialLink),
  );
  const [faqItems, setFaqItems] = useState<FaqItem[]>(() =>
    asRecordArray(faq.items).map(toFaqItem),
  );

  const markDirty = useMarkDirty();
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    markDirty();
  }, [links.length, faqItems.length, markDirty]);

  const pendingFocus = useRef<{ kind: "link" | "faq"; id: string } | null>(
    null,
  );
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const el = document.getElementById(`${target.kind}-${target.id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      el.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        target.kind === "link"
          ? 'input[name$=".href"]'
          : 'input[name$=".question"]',
      )?.focus();
    }, 350);
  }, [links.length, faqItems.length]);

  const updateLink = (id: string, patch: Partial<SocialLink>) =>
    setLinks((current) =>
      current.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    );
  const updateFaq = (id: string, patch: Partial<FaqItem>) =>
    setFaqItems((current) =>
      current.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    );

  const addLink = () => {
    const item = blankLink();
    pendingFocus.current = { kind: "link", id: item.id };
    setLinks((current) => [...current, item]);
  };
  const addFaq = () => {
    const item = blankFaq();
    pendingFocus.current = { kind: "faq", id: item.id };
    setFaqItems((current) => [...current, item]);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onLinksDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLinks((current) => {
      const oldIndex = current.findIndex((i) => i.id === active.id);
      const newIndex = current.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return current;
      return arrayMove(current, oldIndex, newIndex);
    });
    markDirty();
  };
  const onFaqDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setFaqItems((current) => {
      const oldIndex = current.findIndex((i) => i.id === active.id);
      const newIndex = current.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return current;
      return arrayMove(current, oldIndex, newIndex);
    });
    markDirty();
  };

  return (
    <div className="space-y-6">
      <input type="hidden" name="editorType" value="contact-structured" />

      <Fieldset legend="Hero">
        <div className="grid gap-4">
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
      </Fieldset>

      <Fieldset legend="Contact information">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Heading"
            name="contactInfo.heading"
            defaultValue={asString(contactInfo.heading)}
          />
          <TextField
            label="Email"
            name="contactInfo.email"
            defaultValue={asString(contactInfo.email)}
          />
        </div>
      </Fieldset>

      <Fieldset legend="Contact form">
        <div className="grid gap-4">
          <TextField
            label="Heading"
            name="form.heading"
            defaultValue={asString(form.heading)}
          />
          <TextAreaField
            label="Body"
            name="form.body"
            defaultValue={asString(form.body)}
          />
        </div>
      </Fieldset>

      <Fieldset
        legend={`Social links (${links.length})`}
        actions={
          <button
            type="button"
            onClick={addLink}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <PlusIcon /> Add social link
          </button>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Section heading"
              name="social.heading"
              defaultValue={asString(social.heading) || "Follow Us"}
            />
            <TextField
              label="Section body"
              name="social.body"
              defaultValue={asString(social.body)}
            />
          </div>

          {links.length === 0 ? (
            <EmptyState
              label="No social links"
              hint="Click Add social link to add one."
            />
          ) : null}

          <DndContext
            id="contact-links-dnd"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onLinksDragEnd}
          >
            <SortableContext
              items={links.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {links.map((link, index) => (
                  <LinkRow
                    key={link.id}
                    link={link}
                    index={index}
                    onChange={(patch) => updateLink(link.id, patch)}
                    onRemove={() =>
                      setLinks((current) =>
                        current.filter((l) => l.id !== link.id),
                      )
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </Fieldset>

      <Fieldset
        legend={`FAQ (${faqItems.length})`}
        actions={
          <button
            type="button"
            onClick={addFaq}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <PlusIcon /> Add question
          </button>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Section heading"
              name="faq.heading"
              defaultValue={
                asString(faq.heading) || "Frequently Asked Questions"
              }
            />
            <TextField
              label="Section body"
              name="faq.body"
              defaultValue={asString(faq.body)}
            />
          </div>

          {faqItems.length === 0 ? (
            <EmptyState
              label="No FAQ items"
              hint="Click Add question to add one."
            />
          ) : null}

          <DndContext
            id="contact-faq-dnd"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onFaqDragEnd}
          >
            <SortableContext
              items={faqItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {faqItems.map((item, index) => (
                  <FaqRow
                    key={item.id}
                    item={item}
                    index={index}
                    onChange={(patch) => updateFaq(item.id, patch)}
                    onRemove={() =>
                      setFaqItems((current) =>
                        current.filter((f) => f.id !== item.id),
                      )
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </Fieldset>
    </div>
  );
}

function LinkRow({
  link,
  index,
  onChange,
  onRemove,
}: {
  link: SocialLink;
  index: number;
  onChange: (patch: Partial<SocialLink>) => void;
  onRemove: () => void;
}) {
  const fieldName = (field: string) => `social.links.${index}.${field}`;
  const platform =
    PLATFORMS.find((p) => p.value === link.platform) ?? PLATFORMS[0];
  const headingTitle = link.label?.trim() || platform.label;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : "auto",
  } as const;

  const handlePlatformChange = (value: string) => {
    const next = PLATFORMS.find((p) => p.value === value) ?? PLATFORMS[0];
    const patch: Partial<SocialLink> = { platform: value };
    if (KNOWN_LABELS.has(link.label) || link.label === "") {
      patch.label = next.label;
    }
    onChange(patch);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`link-${link.id}`}
      className={
        "rounded-lg border bg-slate-50/60 p-3 " +
        (isDragging ? "border-slate-400 shadow-lg" : "border-slate-200")
      }
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${headingTitle}`}
            className="inline-flex h-6 w-6 cursor-grab touch-none items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-600 active:cursor-grabbing"
          >
            <GripIcon />
          </button>
          <p className="truncate text-sm font-semibold text-slate-900">
            {headingTitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${headingTitle}`}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs font-medium text-rose-600 hover:border-rose-200 hover:bg-rose-50"
        >
          <TrashIcon /> Remove
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[180px_1fr_1fr]">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Platform
          <select
            value={link.platform}
            onChange={(e) => handlePlatformChange(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Label
          <input
            name={fieldName("label")}
            value={link.label}
            onChange={(e) => onChange({ label: e.target.value })}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          URL
          <input
            name={fieldName("href")}
            value={link.href}
            onChange={(e) => onChange({ href: e.target.value })}
            placeholder={platform.placeholder}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </label>
      </div>
    </div>
  );
}

function FaqRow({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: FaqItem;
  index: number;
  onChange: (patch: Partial<FaqItem>) => void;
  onRemove: () => void;
}) {
  const fieldName = (field: string) => `faq.items.${index}.${field}`;
  const headingTitle = item.question?.trim() || `Question ${index + 1}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : "auto",
  } as const;

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`faq-${item.id}`}
      className={
        "rounded-lg border bg-slate-50/60 p-3 " +
        (isDragging ? "border-slate-400 shadow-lg" : "border-slate-200")
      }
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${headingTitle}`}
            className="inline-flex h-6 w-6 cursor-grab touch-none items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-600 active:cursor-grabbing"
          >
            <GripIcon />
          </button>
          <p className="truncate text-sm font-semibold text-slate-900">
            {headingTitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${headingTitle}`}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs font-medium text-rose-600 hover:border-rose-200 hover:bg-rose-50"
        >
          <TrashIcon /> Remove
        </button>
      </div>

      <div className="grid gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Question
          <input
            name={fieldName("question")}
            value={item.question}
            onChange={(e) => onChange({ question: e.target.value })}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Answer
          <textarea
            name={fieldName("answer")}
            value={item.answer}
            onChange={(e) => onChange({ answer: e.target.value })}
            rows={3}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </label>
      </div>
    </div>
  );
}

function Fieldset({
  legend,
  actions,
  children,
}: {
  legend: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <legend className="px-1 text-sm font-semibold text-slate-900">
          {legend}
        </legend>
        {actions}
      </div>
      {children}
    </fieldset>
  );
}

function EmptyState({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-center">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

function TrashIcon() {
  return (
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
      <path d="M3 4h10" />
      <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M4 4l1 9a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l1-9" />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="currentColor"
    >
      <circle cx="6" cy="3.5" r="1" />
      <circle cx="10" cy="3.5" r="1" />
      <circle cx="6" cy="8" r="1" />
      <circle cx="10" cy="8" r="1" />
      <circle cx="6" cy="12.5" r="1" />
      <circle cx="10" cy="12.5" r="1" />
    </svg>
  );
}
