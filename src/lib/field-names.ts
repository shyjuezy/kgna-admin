/**
 * Field-name helpers shared by the generic structured editor (server) and the
 * RepeatableItems row editor (client). Kept in their own module because
 * functions cannot be passed as props across the server/client boundary.
 */

export function isImageFieldName(name: string): boolean {
  const leaf = name.split(".").pop()?.toLowerCase() ?? "";
  return /^(image|imageurl|imageurls|photo|photourl|thumbnail|thumb|cover|coverimage|avatar)$/.test(
    leaf,
  );
}

export function fieldLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

/**
 * Fields that must be one of a fixed set of values. Rendered as a dropdown so
 * a typo cannot silently change meaning - e.g. a mistyped donation frequency
 * falls back to "one-time" on the website rather than erroring.
 */
export const FIELD_OPTIONS: Record<string, string[]> = {
  frequency: ["one-time", "monthly", "annual"],
};

/**
 * Puts well-known keys in a sensible reading order and leaves the rest in the
 * order they appear in the stored content.
 */
const PREFERRED_FIELD_ORDER = [
  "id",
  "frequency",
  "amount",
  "role",
  "name",
  "title",
  "question",
  "label",
  "value",
  "date",
  "time",
  "location",
  "category",
  "impact",
  "answer",
  "description",
  "bio",
  "body",
  "excerpt",
];

export function orderFieldKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const ia = PREFERRED_FIELD_ORDER.indexOf(a);
    const ib = PREFERRED_FIELD_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

/**
 * Rows in some lists carry an identity field the website uses for React keys
 * and for links such as /events/<id>. It is submitted as a hidden field rather
 * than an editable one, because a blank or hand-edited id silently breaks
 * those links.
 */
export const IDENTITY_KEY = "id";

/** Picks an unused identity value for a newly added row. */
export function nextItemId(
  existingRows: Array<Record<string, string>>,
): string {
  const taken = new Set(
    existingRows
      .map((values) => (values[IDENTITY_KEY] ?? "").trim())
      .filter(Boolean),
  );
  const numeric = [...taken]
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value));
  const base = (numeric.length ? Math.max(...numeric) : 0) + 1;

  let candidate = String(base);
  let attempt = 0;
  while (taken.has(candidate)) {
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
  return candidate;
}
