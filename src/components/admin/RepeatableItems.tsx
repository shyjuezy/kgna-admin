"use client";

import { useId, useState } from "react";
import { useMarkDirty } from "@/components/admin/EditorFormShell";
import { ImageUrlField } from "@/components/admin/ImageUrlField";
import { SelectField, TextAreaField } from "@/components/admin/Fields";
import {
  FIELD_OPTIONS,
  IDENTITY_KEY,
  fieldLabel,
  isImageFieldName,
  nextItemId,
} from "@/lib/field-names";

type Row = {
  id: string;
  values: Record<string, string>;
};

/**
 * Add/remove editor for one repeating list of rows.
 *
 * Emits `<namePrefix>.<rowIndex>.<fieldKey>` so the row count can change
 * freely without the parser knowing a fixed length. Callers supply the prefix:
 *   generic editor -> section.<i>.array.<arrayName>
 *   about editor   -> members
 *
 * `declareName` names a hidden field listing this list, which lets a parser
 * tell "emptied by the editor" apart from "not present in the form" - without
 * it, deleting every row makes the key vanish and the website falls back to
 * its hardcoded defaults.
 */
export function RepeatableItems({
  namePrefix,
  declareName,
  declareValue,
  itemLabel,
  fieldKeys,
  fieldLabels,
  initialItems,
  folder,
}: {
  namePrefix: string;
  declareName?: string;
  declareValue?: string;
  itemLabel: string;
  fieldKeys: string[];
  /** Overrides the auto-derived label for specific field keys. */
  fieldLabels?: Record<string, string>;
  initialItems: Array<Record<string, string>>;
  folder: string;
}) {
  const reactId = useId();
  const markDirty = useMarkDirty();
  const [nextId, setNextId] = useState(initialItems.length);
  const [rows, setRows] = useState<Row[]>(() =>
    initialItems.map((values, index) => ({
      id: `${reactId}-${index}`,
      values,
    })),
  );

  const addRow = () => {
    setRows((current) => {
      const blank: Record<string, string> = {};
      for (const key of fieldKeys) {
        blank[key] = "";
      }
      if (fieldKeys.includes(IDENTITY_KEY)) {
        blank[IDENTITY_KEY] = nextItemId(current.map((row) => row.values));
      }
      return [...current, { id: `${reactId}-new-${nextId}`, values: blank }];
    });
    setNextId((value) => value + 1);
    markDirty();
  };

  const removeRow = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id));
    markDirty();
  };

  const updateRow = (id: string, key: string, value: string) => {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? { ...row, values: { ...row.values, [key]: value } }
          : row,
      ),
    );
    markDirty();
  };

  const singular = itemLabel.replace(/s$/, "").toLowerCase() || "item";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">
          {itemLabel} ({rows.length})
        </p>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <PlusIcon /> Add {singular}
        </button>
      </div>

      {/* Declares the list so an emptied one saves as [] instead of vanishing. */}
      {declareName ? (
        <input type="hidden" name={declareName} value={declareValue ?? ""} />
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-center">
          <p className="text-sm font-medium text-slate-700">
            No {itemLabel.toLowerCase()} yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Click Add {singular} to create one. Saving with none removes the
            list from the page.
          </p>
        </div>
      ) : null}

      {rows.map((row, rowIndex) => (
        <div key={row.id} className="rounded bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {singular} {rowIndex + 1}
              {row.values[IDENTITY_KEY] ? (
                <span className="ml-2 normal-case tracking-normal text-slate-400">
                  id {row.values[IDENTITY_KEY]}
                </span>
              ) : null}
            </p>
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              aria-label={`Remove ${singular} ${rowIndex + 1}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <TrashIcon /> Remove
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {fieldKeys.map((key) => {
              const fieldName = `${namePrefix}.${rowIndex}.${key}`;
              const value = row.values[key] ?? "";

              // Preserved, never hand-edited - see IDENTITY_KEY.
              if (key === IDENTITY_KEY) {
                return (
                  <input
                    key={key}
                    type="hidden"
                    name={fieldName}
                    value={value}
                  />
                );
              }

              const options = FIELD_OPTIONS[key];
              if (options) {
                // Keep any pre-existing value selectable so opening the editor
                // never silently rewrites content it did not recognise.
                const choices = options.includes(value) || !value
                  ? options
                  : [...options, value];
                return (
                  <SelectField
                    key={key}
                    label={fieldLabels?.[key] ?? fieldLabel(key)}
                    name={fieldName}
                    value={value || options[0]}
                    options={choices}
                    onChange={(next) => updateRow(row.id, key, next)}
                  />
                );
              }

              if (isImageFieldName(key)) {
                return (
                  <ImageUrlField
                    key={key}
                    label={fieldLabels?.[key] ?? fieldLabel(key)}
                    name={fieldName}
                    defaultValue={value}
                    folder={folder}
                    className="md:col-span-2"
                  />
                );
              }

              const leaf = key.toLowerCase();
              const isLong =
                leaf.includes("description") ||
                leaf.includes("body") ||
                leaf.includes("bio");

              return (
                <TextAreaField
                  key={key}
                  label={fieldLabels?.[key] ?? fieldLabel(key)}
                  name={fieldName}
                  value={value}
                  onChange={(next) => updateRow(row.id, key, next)}
                  rows={isLong ? 3 : 1}
                />
              );
            })}
          </div>
        </div>
      ))}

      {rows.length > 0 ? (
        <p className="text-xs text-slate-500">
          Rows left completely blank are discarded when you save.
        </p>
      ) : null}
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
      <path d="M6.5 4V2.5h3V4" />
      <path d="M4.5 4l.5 9h6l.5-9" />
    </svg>
  );
}
