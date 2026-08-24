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
import { CloudinaryUploadButton } from "@/components/admin/CloudinaryUploadButton";
import { ImageDropZone } from "@/components/admin/ImageDropZone";
import {
  TextField,
  TextAreaField,
  SelectField,
} from "@/components/admin/Fields";

type SectionProps = Record<string, unknown>;

type GalleryItem = {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  date: string;
  location: string;
  featured: string;
};

/**
 * These are the filters the website's gallery page offers. Anything stored
 * outside this set is invisible there — it only shows under "All Photos".
 */
const CATEGORY_OPTIONS = [
  "events",
  "culture",
  "landscape",
  "community",
  "heritage",
];

/** Earlier option names, mapped to the website's equivalents. */
const LEGACY_CATEGORIES: Record<string, string> = {
  nature: "landscape",
  people: "community",
};

function normalizeCategory(raw: string) {
  return LEGACY_CATEGORIES[raw] ?? raw;
}

/**
 * Keep a value the list no longer offers selectable rather than dropping it.
 * A controlled select whose value is absent renders blank and would quietly
 * rewrite the category on the next save.
 */
function categoryOptionsFor(category: string) {
  return CATEGORY_OPTIONS.includes(category)
    ? CATEGORY_OPTIONS
    : [...CATEGORY_OPTIONS, category];
}

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

function toGalleryItem(raw: SectionProps): GalleryItem {
  return {
    id: asString(raw.id) || cryptoId(),
    title: asString(raw.title),
    description: asString(raw.description),
    image: asString(raw.image),
    category: normalizeCategory(asString(raw.category) || "events"),
    date: asString(raw.date),
    location: asString(raw.location),
    featured: asString(raw.featured),
  };
}

function blankItem(): GalleryItem {
  return {
    id: cryptoId(),
    title: "",
    description: "",
    image: "",
    category: "events",
    date: "",
    location: "",
    featured: "",
  };
}

export function GalleryStructuredEditor({
  content,
}: {
  content: CmsPageContent;
}) {
  const hero = getSection(content, "hero");
  const gallery = getSection(content, "gallery");

  const [items, setItems] = useState<GalleryItem[]>(() =>
    asRecordArray(gallery.items).map(toGalleryItem),
  );

  const markDirty = useMarkDirty();
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    markDirty();
  }, [items.length, markDirty]);

  const pendingFocusId = useRef<string | null>(null);
  useEffect(() => {
    const id = pendingFocusId.current;
    if (!id) return;
    pendingFocusId.current = null;
    const el = document.getElementById(`photo-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      el.querySelector<HTMLInputElement>('input[name$=".title"]')?.focus();
    }, 350);
  }, [items.length]);

  const addPhoto = () => {
    const item = blankItem();
    pendingFocusId.current = item.id;
    setItems((current) => [...current, item]);
  };

  const updateItem = (id: string, patch: Partial<GalleryItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
    // Uploads patch the row without emitting an input event, so the form shell
    // would never see them. Typing already bubbles; marking twice is harmless.
    markDirty();
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((current) => {
      const oldIndex = current.findIndex((i) => i.id === active.id);
      const newIndex = current.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return current;
      return arrayMove(current, oldIndex, newIndex);
    });
    markDirty();
  };

  return (
    <div className="space-y-6">
      <input type="hidden" name="editorType" value="gallery-structured" />

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

      <Fieldset legend="Section copy">
        <div className="grid gap-4">
          <TextField
            label="Featured heading"
            name="gallery.featuredHeading"
            defaultValue={
              asString(gallery.featuredHeading) || "Featured Photos"
            }
          />
          <TextField
            label="CTA heading"
            name="gallery.ctaHeading"
            defaultValue={asString(gallery.ctaHeading) || "Share Your Memories"}
          />
          <TextAreaField
            label="CTA body"
            name="gallery.ctaBody"
            defaultValue={asString(gallery.ctaBody)}
          />
        </div>
      </Fieldset>

      <Fieldset
        legend={`Photos (${items.length})`}
        actions={
          <button
            type="button"
            onClick={addPhoto}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <PlusIcon /> Add photo
          </button>
        }
      >
        <div className="space-y-4">
          {items.length === 0 ? (
            <EmptyState
              label="No photos yet"
              hint="Click Add photo to upload your first image."
            />
          ) : null}
          <DndContext
            id="gallery-photos-dnd"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {items.map((item, index) => (
                  <PhotoRow
                    key={item.id}
                    item={item}
                    index={index}
                    onChange={(patch) => updateItem(item.id, patch)}
                    onRemove={() =>
                      setItems((current) =>
                        current.filter((i) => i.id !== item.id),
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

function PhotoRow({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: GalleryItem;
  index: number;
  onChange: (patch: Partial<GalleryItem>) => void;
  onRemove: () => void;
}) {
  const fieldName = (field: string) => `gallery.items.${index}.${field}`;
  const headingTitle = item.title?.trim() || `Photo ${index + 1}`;
  const isFeatured = item.featured === "yes";

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
      id={`photo-${item.id}`}
      className={
        "rounded-lg border bg-slate-50/60 p-4 " +
        (isDragging ? "border-slate-400 shadow-lg" : "border-slate-200")
      }
    >
      <input type="hidden" name={fieldName("id")} value={item.id} />
      <input
        type="hidden"
        name={fieldName("featured")}
        value={isFeatured ? "yes" : ""}
      />

      <div className="mb-3 flex items-center justify-between gap-3">
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
          {isFeatured ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700">
              <StarIcon /> Featured
            </span>
          ) : null}
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

      <div className="grid gap-4 md:grid-cols-[160px_1fr]">
        <div className="flex flex-col gap-2">
          <ImagePreview src={item.image} />
          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) =>
                onChange({ featured: e.target.checked ? "yes" : "" })
              }
              className="h-4 w-4 rounded border-slate-300"
            />
            Featured photo
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Title"
            name={fieldName("title")}
            value={item.title}
            onChange={(value) => onChange({ title: value })}
          />
          <SelectField
            label="Category"
            name={fieldName("category")}
            value={item.category}
            options={categoryOptionsFor(item.category)}
            onChange={(value) => onChange({ category: value })}
          />
          <TextAreaField
            label="Description"
            name={fieldName("description")}
            value={item.description}
            onChange={(value) => onChange({ description: value })}
            rows={2}
            className="md:col-span-2"
          />
          <ImageDropZone
            folder="kgna/gallery"
            onUploaded={(url) => onChange({ image: url })}
            className="md:col-span-2"
          >
            <div className="flex items-end gap-2">
              <TextField
                label="Image URL"
                name={fieldName("image")}
                value={item.image}
                onChange={(value) => onChange({ image: value })}
                placeholder="https://…"
                className="flex-1"
              />
              <CloudinaryUploadButton
                folder="kgna/gallery"
                onUploaded={(url) => onChange({ image: url })}
                className="mb-px h-[38px]"
              />
            </div>
          </ImageDropZone>
          <TextField
            label="Date"
            name={fieldName("date")}
            value={item.date}
            placeholder="e.g. June 2024"
            onChange={(value) => onChange({ date: value })}
          />
          <TextField
            label="Location"
            name={fieldName("location")}
            value={item.location}
            onChange={(value) => onChange({ location: value })}
          />
        </div>
      </div>
    </div>
  );
}

function ImagePreview({ src }: { src: string }) {
  const isUrl = /^https?:\/\//i.test(src.trim());
  return (
    <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-white">
      {isUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span className="px-2 text-center text-[11px] text-slate-400">
          Image preview
        </span>
      )}
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

function StarIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-3 w-3"
      fill="currentColor"
    >
      <path d="M8 1.5l1.95 4 4.4.65-3.18 3.1.75 4.38L8 11.55 4.08 13.6l.75-4.38L1.65 6.15l4.4-.65L8 1.5z" />
    </svg>
  );
}
