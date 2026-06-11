CREATE TYPE "public"."article_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."candidate_status" AS ENUM('new', 'published', 'ignored');--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('models', 'tools');--> statement-breakpoint
CREATE TYPE "public"."fetch_status" AS ENUM('never', 'success', 'failed');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "article_tags" (
	"article_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid,
	"source_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"url" text NOT NULL,
	"category" "category" NOT NULL,
	"status" "article_status" DEFAULT 'published' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"canonical_url_hash" text NOT NULL,
	"summary" text,
	"published_at" timestamp with time zone,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "candidate_status" DEFAULT 'new' NOT NULL,
	"raw_payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"homepage_url" text NOT NULL,
	"feed_url" text NOT NULL,
	"category" "category" NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"last_fetched_at" timestamp with time zone,
	"last_fetch_status" "fetch_status" DEFAULT 'never' NOT NULL,
	"last_fetch_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "articles" ADD CONSTRAINT "articles_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "articles" ADD CONSTRAINT "articles_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "candidates" ADD CONSTRAINT "candidates_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "article_tags_article_id_tag_id_idx" ON "article_tags" USING btree ("article_id","tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "articles_slug_idx" ON "articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "articles_status_published_at_idx" ON "articles" USING btree ("status","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "candidates_canonical_url_hash_idx" ON "candidates" USING btree ("canonical_url_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "candidates_source_status_idx" ON "candidates" USING btree ("source_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sources_feed_url_idx" ON "sources" USING btree ("feed_url");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sources_enabled_idx" ON "sources" USING btree ("enabled");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tags_slug_idx" ON "tags" USING btree ("slug");