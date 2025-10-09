ALTER TABLE "membership_plans" ADD COLUMN "features_en" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "membership_plans" DROP COLUMN "features";