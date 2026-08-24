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

type EventItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  imageUrl: string;
  registrationUrl: string;
};

const CATEGORY_OPTIONS = [
  "cultural",
  "educational",
  "social",
  "religious",
  "youth",
  "fundraiser",
  "other",
];

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

function toEventItem(raw: SectionProps): EventItem {
  return {
    id: asString(raw.id) || cryptoId(),
    title: asString(raw.title),
    description: asString(raw.description),
    date: asString(raw.date),
    time: asString(raw.time),
    location: asString(raw.location),
    category: asString(raw.category) || "cultural",
    imageUrl: asString(raw.imageUrl),
    registrationUrl: asString(raw.registrationUrl),
  };
}

function cryptoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

function blankEvent(): EventItem {
  return {
    id: cryptoId(),
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "cultural",
    imageUrl: "",
    registrationUrl: "",
  };
}

export function EventsStructuredEditor({
  content,
}: {
  content: CmsPageContent;
}) {
  const hero = getSection(content, "hero");
  const events = getSection(content, "events");
  const newsletter = getSection(content, "newsletter");

  const [upcoming, setUpcoming] = useState<EventItem[]>(() =>
    asRecordArray(events.upcoming).map(toEventItem),
  );
  const [past, setPast] = useState<EventItem[]>(() =>
    asRecordArray(events.past).map(toEventItem),
  );

  const markDirty = useMarkDirty();
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    markDirty();
  }, [upcoming.length, past.length, markDirty]);

  const pendingFocusId = useRef<string | null>(null);
  useEffect(() => {
    const id = pendingFocusId.current;
    if (!id) return;
    pendingFocusId.current = null;
    const el = document.getElementById(`event-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      el.querySelector<HTMLInputElement>('input[name$=".title"]')?.focus();
    }, 350);
  }, [upcoming.length, past.length]);

  const addUpcoming = () => {
    const item = blankEvent();
    pendingFocusId.current = item.id;
    setUpcoming((items) => [...items, item]);
  };
  const addPast = () => {
    const item = blankEvent();
    pendingFocusId.current = item.id;
    setPast((items) => [...items, item]);
  };

  // Uploads patch a row without emitting an input event, so the form shell
  // would never see them. Typing already bubbles; marking twice is harmless.
  const updateUpcoming = (id: string, patch: Partial<EventItem>) => {
    setUpcoming((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
    markDirty();
  };
  const updatePast = (id: string, patch: Partial<EventItem>) => {
    setPast((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
    markDirty();
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const reorder = (setter: typeof setUpcoming) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setter((current) => {
      const oldIndex = current.findIndex((i) => i.id === active.id);
      const newIndex = current.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return current;
      return arrayMove(current, oldIndex, newIndex);
    });
    markDirty();
  };

  return (
    <div className="space-y-6">
      <input type="hidden" name="editorType" value="events-structured" />

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

      <Fieldset legend="Section headings">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Upcoming heading"
            name="events.upcomingHeading"
            defaultValue={asString(events.upcomingHeading) || "Upcoming Events"}
          />
          <TextField
            label="Past heading"
            name="events.pastHeading"
            defaultValue={asString(events.pastHeading) || "Past Events"}
          />
        </div>
      </Fieldset>

      <Fieldset
        legend="Upcoming events"
        actions={
          <button
            type="button"
            onClick={addUpcoming}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <PlusIcon /> Add upcoming event
          </button>
        }
      >
        <div className="space-y-4">
          {upcoming.length === 0 ? (
            <EmptyState
              label="No upcoming events"
              hint="Click Add upcoming event to create one."
            />
          ) : null}
          <DndContext
            id="events-upcoming-dnd"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={reorder(setUpcoming)}
          >
            <SortableContext
              items={upcoming.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {upcoming.map((item, index) => (
                  <EventRow
                    key={item.id}
                    item={item}
                    index={index}
                    prefix="events.upcoming"
                    showRegistration
                    onChange={(patch) => updateUpcoming(item.id, patch)}
                    onRemove={() =>
                      setUpcoming((items) =>
                        items.filter((i) => i.id !== item.id),
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
        legend="Past events"
        actions={
          <button
            type="button"
            onClick={addPast}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <PlusIcon /> Add past event
          </button>
        }
      >
        <div className="space-y-4">
          {past.length === 0 ? (
            <EmptyState
              label="No past events"
              hint="Click Add past event to archive one."
            />
          ) : null}
          <DndContext
            id="events-past-dnd"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={reorder(setPast)}
          >
            <SortableContext
              items={past.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {past.map((item, index) => (
                  <EventRow
                    key={item.id}
                    item={item}
                    index={index}
                    prefix="events.past"
                    showRegistration={false}
                    onChange={(patch) => updatePast(item.id, patch)}
                    onRemove={() =>
                      setPast((items) => items.filter((i) => i.id !== item.id))
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </Fieldset>

      <Fieldset legend="Newsletter">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Heading"
            name="newsletter.heading"
            defaultValue={asString(newsletter.heading)}
          />
          <TextField
            label="Button label"
            name="newsletter.buttonLabel"
            defaultValue={asString(newsletter.buttonLabel)}
          />
          <TextAreaField
            label="Body"
            name="newsletter.body"
            defaultValue={asString(newsletter.body)}
          />
          <TextField
            label="Button link"
            name="newsletter.buttonHref"
            defaultValue={asString(newsletter.buttonHref)}
          />
        </div>
      </Fieldset>
    </div>
  );
}

function EventRow({
  item,
  index,
  prefix,
  showRegistration,
  onChange,
  onRemove,
}: {
  item: EventItem;
  index: number;
  prefix: string;
  showRegistration: boolean;
  onChange: (patch: Partial<EventItem>) => void;
  onRemove: () => void;
}) {
  const fieldName = (field: string) => `${prefix}.${index}.${field}`;
  const headingTitle = item.title?.trim() || `Event ${index + 1}`;

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
      id={`event-${item.id}`}
      className={
        "rounded-lg border bg-slate-50/60 p-4 " +
        (isDragging ? "border-slate-400 shadow-lg" : "border-slate-200")
      }
    >
      <input type="hidden" name={fieldName("id")} value={item.id} />

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
          options={CATEGORY_OPTIONS}
          onChange={(value) => onChange({ category: value })}
        />
        <DateField
          label="Date"
          name={fieldName("date")}
          value={item.date}
          onChange={(value) => onChange({ date: value })}
        />
        <TextField
          label="Time"
          name={fieldName("time")}
          value={item.time}
          placeholder="e.g. 5:00 PM - 10:00 PM"
          onChange={(value) => onChange({ time: value })}
        />
        <TextField
          label="Location"
          name={fieldName("location")}
          value={item.location}
          onChange={(value) => onChange({ location: value })}
          className="md:col-span-2"
        />
        <TextAreaField
          label="Description"
          name={fieldName("description")}
          value={item.description}
          onChange={(value) => onChange({ description: value })}
          className="md:col-span-2"
          rows={3}
        />
        <ImageDropZone
          folder="kgna/events"
          onUploaded={(url) => onChange({ imageUrl: url })}
          className={showRegistration ? "" : "md:col-span-2"}
        >
          <div className="flex items-end gap-2">
            <TextField
              label="Image URL"
              name={fieldName("imageUrl")}
              value={item.imageUrl}
              placeholder="https://…"
              onChange={(value) => onChange({ imageUrl: value })}
              className="flex-1"
            />
            <CloudinaryUploadButton
              folder="kgna/events"
              onUploaded={(url) => onChange({ imageUrl: url })}
              className="mb-px h-[38px]"
            />
          </div>
        </ImageDropZone>
        {showRegistration ? (
          <TextField
            label="Registration URL"
            name={fieldName("registrationUrl")}
            value={item.registrationUrl}
            placeholder="# or https://…"
            onChange={(value) => onChange({ registrationUrl: value })}
          />
        ) : null}
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

function DateField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      <input
        type="date"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      />
    </label>
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
