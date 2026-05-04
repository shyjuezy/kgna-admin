"use client";

import { useState } from "react";

type CommonProps = {
  label: string;
  name: string;
  className?: string;
  placeholder?: string;
  /**
   * Soft character recommendation. Renders a counter beneath the field that
   * turns amber when the user exceeds the suggested length. Never blocks
   * submission. If omitted, an automatic recommendation may apply based on
   * the field name (see getRecommendedLength). Pass 0 to suppress.
   */
  recommendedLength?: number;
};

type ControlledMode = {
  value: string;
  onChange: (value: string) => void;
  defaultValue?: never;
};

type UncontrolledMode = {
  value?: never;
  onChange?: never;
  defaultValue?: string;
};

export type TextFieldProps = CommonProps & (ControlledMode | UncontrolledMode);
export type TextAreaFieldProps = TextFieldProps & { rows?: number };

const RECOMMENDATIONS: Array<[RegExp, number]> = [
  [/^(title|heading|subheading)$/, 80],
  [/^(excerpt|summary|tagline)$/, 160],
  [/^(description|bio)$/, 220],
  [/^body$/, 300],
];

export function getRecommendedLength(name: string): number | undefined {
  const leaf = name.split(".").pop()?.toLowerCase() ?? "";
  for (const [pattern, length] of RECOMMENDATIONS) {
    if (pattern.test(leaf)) return length;
  }
  return undefined;
}

const inputBase =
  "rounded-md border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

function CharCounter({ length, max }: { length: number; max: number }) {
  const over = length > max;
  return (
    <span
      className={
        "mt-0.5 text-[11px] font-normal " +
        (over ? "text-amber-600" : "text-slate-400")
      }
      aria-live="polite"
    >
      {length} / {max}
    </span>
  );
}

function resolveLimit(
  name: string,
  recommendedLength?: number,
): number | undefined {
  if (recommendedLength === undefined) return getRecommendedLength(name);
  if (recommendedLength === 0) return undefined;
  return recommendedLength;
}

export function TextField(props: TextFieldProps) {
  const { label, name, className, placeholder, recommendedLength } = props;
  const isControlled = "value" in props && props.value !== undefined;
  const initial = isControlled
    ? (props.value as string)
    : (props.defaultValue ?? "");
  const [localLen, setLocalLen] = useState(initial.length);
  const max = resolveLimit(name, recommendedLength);
  const length = isControlled ? (props.value as string).length : localLen;

  return (
    <label
      className={`flex flex-col gap-1 text-sm font-medium text-slate-700 ${className ?? ""}`}
    >
      {label}
      <input
        name={name}
        placeholder={placeholder}
        className={inputBase}
        {...(isControlled
          ? {
              value: props.value,
              onChange: (e) => props.onChange?.(e.target.value),
            }
          : {
              defaultValue: props.defaultValue,
              onInput: max
                ? (e) =>
                    setLocalLen((e.target as HTMLInputElement).value.length)
                : undefined,
            })}
      />
      {max ? <CharCounter length={length} max={max} /> : null}
    </label>
  );
}

export function TextAreaField(props: TextAreaFieldProps) {
  const {
    label,
    name,
    className,
    placeholder,
    rows = 3,
    recommendedLength,
  } = props;
  const isControlled = "value" in props && props.value !== undefined;
  const initial = isControlled
    ? (props.value as string)
    : (props.defaultValue ?? "");
  const [localLen, setLocalLen] = useState(initial.length);
  const max = resolveLimit(name, recommendedLength);
  const length = isControlled ? (props.value as string).length : localLen;

  return (
    <label
      className={`flex flex-col gap-1 text-sm font-medium text-slate-700 ${className ?? ""}`}
    >
      {label}
      <textarea
        name={name}
        placeholder={placeholder}
        rows={rows}
        className={inputBase}
        {...(isControlled
          ? {
              value: props.value,
              onChange: (e) => props.onChange?.(e.target.value),
            }
          : {
              defaultValue: props.defaultValue,
              onInput: max
                ? (e) =>
                    setLocalLen((e.target as HTMLTextAreaElement).value.length)
                : undefined,
            })}
      />
      {max ? <CharCounter length={length} max={max} /> : null}
    </label>
  );
}

export function SelectField({
  label,
  name,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  name: string;
  value: string;
  options: string[] | { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
  return (
    <label
      className={`flex flex-col gap-1 text-sm font-medium text-slate-700 ${className ?? ""}`}
    >
      {label}
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputBase + " capitalize"}
      >
        {normalized.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="capitalize"
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
