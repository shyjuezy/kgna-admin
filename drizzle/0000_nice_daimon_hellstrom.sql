CREATE TABLE "kgna_admin_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"draft_content" jsonb NOT NULL,
	"published_content" jsonb,
	"published_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kgna_admin_pages_slug_unique" UNIQUE("slug")
);
