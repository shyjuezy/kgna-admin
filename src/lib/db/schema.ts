import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const pages = pgTable("kgna_admin_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  status: text("status").notNull().default("draft"),
  draftContent: jsonb("draft_content").notNull(),
  publishedContent: jsonb("published_content"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
