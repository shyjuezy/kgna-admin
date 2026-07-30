import type { CmsPageContent } from "@/lib/content";

/**
 * Reads a variable-length list of rows named `<prefix>.<index>.<field>`.
 *
 * Unlike the fixed-length formItems(), this does not need to know how many rows
 * the editor rendered, so rows can be added beyond the old cap and removing all
 * of them yields [] rather than silently keeping stale entries.
 */
export function formListItems(
  formData: FormData,
  prefix: string,
  fields: string[],
): Array<Record<string, string>> {
  const rows = new Map<number, Record<string, string>>();

  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string" || !key.startsWith(`${prefix}.`)) {
      continue;
    }
    const [rawIndex, field] = key.slice(prefix.length + 1).split(".");
    const index = Number(rawIndex);
    if (!field || !fields.includes(field) || !Number.isInteger(index)) {
      continue;
    }
    const row = rows.get(index) ?? {};
    row[field] = value.trim();
    rows.set(index, row);
  }

  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, row]) =>
      Object.fromEntries(fields.map((field) => [field, row[field] ?? ""])),
    )
    .filter((row) => Object.values(row).some(Boolean));
}

/**
 * Parses a submission from the generic structured editor.
 *
 * Field-name contract (see RepeatableItems):
 *   section.<i>.type                              - section discriminator
 *   section.<i>.prop.<key>                        - scalar prop
 *   section.<i>.array.<name>.<row>.<field>        - one cell of a list row
 *   section.<i>.arrayNames                        - one entry per list rendered
 *
 * Kept free of Next/DB imports so it can be exercised directly in isolation.
 */
export function buildGenericContent(formData: FormData): CmsPageContent {
  const sections: CmsPageContent["sections"] = [];

  for (let sectionIndex = 0; ; sectionIndex += 1) {
    const type = (
      (formData.get(`section.${sectionIndex}.type`) as string | null) ?? ""
    ).trim();
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

    // The editor declares every list it rendered, so a list the user emptied
    // saves as [] instead of dropping out of the payload - otherwise the
    // website would fall back to its hardcoded defaults and the deleted rows
    // would appear to come back.
    for (const declared of formData.getAll(
      `section.${sectionIndex}.arrayNames`,
    )) {
      if (typeof declared === "string" && declared && !arrays.has(declared)) {
        arrays.set(declared, []);
      }
    }

    for (const [arrayName, items] of arrays.entries()) {
      props[arrayName] = items.filter(
        (item) => item && Object.values(item).some(Boolean),
      );
    }

    sections.push({ type, props });
  }

  return {
    title:
      ((formData.get("title") as string | null) ?? "").trim() || "Untitled",
    sections,
  };
}
