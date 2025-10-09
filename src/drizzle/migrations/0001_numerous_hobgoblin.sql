DROP INDEX "membership_plans_name_idx";--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "name_en" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "description_en" text;--> statement-breakpoint
CREATE INDEX "membership_plans_name_idx" ON "membership_plans" USING btree ("name_en");--> statement-breakpoint
ALTER TABLE "membership_plans" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "membership_plans" DROP COLUMN "description";