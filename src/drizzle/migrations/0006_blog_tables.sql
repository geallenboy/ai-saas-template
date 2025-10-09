CREATE TYPE "blog_post_status" AS ENUM ('draft','scheduled','published','archived');
--> statement-breakpoint
CREATE TABLE "blog_posts" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "title" varchar(200) NOT NULL,
    "slug" varchar(200) NOT NULL,
    "summary" text,
    "content" text NOT NULL,
    "cover_image_url" text,
    "tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
    "is_featured" boolean DEFAULT false NOT NULL,
    "status" "blog_post_status" DEFAULT 'draft' NOT NULL,
    "locale" varchar(10) DEFAULT 'zh' NOT NULL,
    "reading_minutes" integer,
    "published_at" timestamptz,
    "author_id" text,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "blog_posts_slug_locale_idx" ON "blog_posts" ("locale","slug");
--> statement-breakpoint
CREATE INDEX "blog_posts_published_at_idx" ON "blog_posts" ("published_at");
--> statement-breakpoint
CREATE INDEX "blog_posts_status_idx" ON "blog_posts" ("status");
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
