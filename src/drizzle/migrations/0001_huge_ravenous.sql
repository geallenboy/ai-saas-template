CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" varchar(200),
	"model" varchar(50) NOT NULL,
	"type" varchar(50) DEFAULT 'chat',
	"message_count" integer DEFAULT 0,
	"total_tokens" integer DEFAULT 0,
	"total_cost" numeric(10, 6) DEFAULT '0',
	"is_archived" boolean DEFAULT false,
	"is_shared" boolean DEFAULT false,
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"tokens" integer DEFAULT 0,
	"cost" numeric(10, 6) DEFAULT '0',
	"model" varchar(50),
	"latency" integer,
	"rating" integer,
	"feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255),
	"name" varchar(200) NOT NULL,
	"name_de" varchar(200),
	"description" text,
	"description_de" text,
	"category" varchar(50) NOT NULL,
	"prompt" text NOT NULL,
	"prompt_de" text,
	"variables" jsonb DEFAULT '[]'::jsonb,
	"is_public" boolean DEFAULT false,
	"is_system" boolean DEFAULT false,
	"requires_membership" boolean DEFAULT false,
	"use_count" integer DEFAULT 0,
	"rating" numeric(3, 2) DEFAULT '0',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"key_hash" text NOT NULL,
	"key_prefix" varchar(10) NOT NULL,
	"scopes" jsonb DEFAULT '["ai:chat"]'::jsonb,
	"requests_used" integer DEFAULT 0,
	"requests_limit" integer DEFAULT 1000,
	"last_used_at" timestamp,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"name_de" varchar(100),
	"description" text,
	"discount_type" varchar(20) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"applicable_plans" jsonb,
	"min_amount" numeric(10, 2),
	"max_uses" integer,
	"used_count" integer DEFAULT 0,
	"max_uses_per_user" integer DEFAULT 1,
	"starts_at" timestamp,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(200) NOT NULL,
	"title_de" varchar(200),
	"message" text NOT NULL,
	"message_de" text,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	"data_type" varchar(20) NOT NULL,
	"is_editable" boolean DEFAULT true,
	"is_secret" boolean DEFAULT false,
	"updated_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_configs_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "sync_logs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_permissions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_roles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "sync_logs" CASCADE;--> statement-breakpoint
DROP TABLE "user_permissions" CASCADE;--> statement-breakpoint
DROP TABLE "user_roles" CASCADE;--> statement-breakpoint
DROP TABLE "user_sessions" CASCADE;--> statement-breakpoint
DROP INDEX "users_last_login_idx";--> statement-breakpoint
DROP INDEX "users_phone_idx";--> statement-breakpoint
ALTER TABLE "membership_plans" ALTER COLUMN "features" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "membership_plans" ALTER COLUMN "features" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "membership_plans" ALTER COLUMN "features_de" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "membership_plans" ALTER COLUMN "features_de" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "membership_plans" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "membership_plans" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_records" ALTER COLUMN "metadata" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "payment_records" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_records" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_memberships" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_memberships" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_usage_limits" ALTER COLUMN "reset_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_usage_limits" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_usage_limits" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "full_name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "preferences" SET DEFAULT '{"theme":"light","language":"en","currency":"USD","timezone":"UTC"}'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "locale" SET DEFAULT 'en';--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "yearly_discount_percent" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "max_api_calls" integer DEFAULT -1;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "permissions" jsonb DEFAULT '{"apiAccess":false,"customModels":false,"prioritySupport":false,"exportData":true,"bulkOperations":false,"advancedAnalytics":false}'::jsonb;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "is_featured" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "payment_records" ADD COLUMN "stripe_invoice_id" varchar(255);--> statement-breakpoint
ALTER TABLE "payment_records" ADD COLUMN "tax" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payment_records" ADD COLUMN "fees" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payment_records" ADD COLUMN "net_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "payment_records" ADD COLUMN "coupon_code" varchar(50);--> statement-breakpoint
ALTER TABLE "payment_records" ADD COLUMN "discount_amount" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payment_records" ADD COLUMN "refund_amount" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payment_records" ADD COLUMN "refunded_at" timestamp;--> statement-breakpoint
ALTER TABLE "payment_records" ADD COLUMN "refund_reason" text;--> statement-breakpoint
ALTER TABLE "payment_records" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "payment_records" ADD COLUMN "failed_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_memberships" ADD COLUMN "original_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "user_memberships" ADD COLUMN "discount_amount" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "user_memberships" ADD COLUMN "stripe_subscription_id" varchar(255);--> statement-breakpoint
ALTER TABLE "user_memberships" ADD COLUMN "auto_renew" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_memberships" ADD COLUMN "next_renewal_date" timestamp;--> statement-breakpoint
ALTER TABLE "user_memberships" ADD COLUMN "renewal_attempts" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_memberships" ADD COLUMN "source" varchar(50);--> statement-breakpoint
ALTER TABLE "user_memberships" ADD COLUMN "cancelled_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_memberships" ADD COLUMN "cancel_reason" text;--> statement-breakpoint
ALTER TABLE "user_memberships" ADD COLUMN "cancelled_by" varchar(255);--> statement-breakpoint
ALTER TABLE "user_usage_limits" ADD COLUMN "used_api_calls" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_usage_limits" ADD COLUMN "monthly_use_cases" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_usage_limits" ADD COLUMN "monthly_tutorials" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_usage_limits" ADD COLUMN "monthly_blogs" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_usage_limits" ADD COLUMN "monthly_api_calls" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_usage_limits" ADD COLUMN "current_period_start" timestamp;--> statement-breakpoint
ALTER TABLE "user_usage_limits" ADD COLUMN "current_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "admin_level" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_use_cases" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_tutorials" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_blogs" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "country" varchar(10);--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_templates" ADD CONSTRAINT "prompt_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_configs" ADD CONSTRAINT "system_configs_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversations_user_id_idx" ON "conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "conversations_type_idx" ON "conversations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "conversations_last_message_idx" ON "conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "conversations_archived_idx" ON "conversations" USING btree ("is_archived");--> statement-breakpoint
CREATE INDEX "messages_conversation_id_idx" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "messages_role_idx" ON "messages" USING btree ("role");--> statement-breakpoint
CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "prompt_templates_user_id_idx" ON "prompt_templates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "prompt_templates_category_idx" ON "prompt_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "prompt_templates_public_idx" ON "prompt_templates" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "prompt_templates_system_idx" ON "prompt_templates" USING btree ("is_system");--> statement-breakpoint
CREATE INDEX "api_keys_user_id_idx" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_keys_key_hash_idx" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "api_keys_active_idx" ON "api_keys" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "coupons_active_idx" ON "coupons" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "coupons_expires_at_idx" ON "coupons" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "system_configs_key_idx" ON "system_configs" USING btree ("key");--> statement-breakpoint
CREATE INDEX "system_configs_category_idx" ON "system_configs" USING btree ("category");--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_usage_limits" ADD CONSTRAINT "user_usage_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "membership_plans_name_idx" ON "membership_plans" USING btree ("name");--> statement-breakpoint
CREATE INDEX "membership_plans_is_active_idx" ON "membership_plans" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "membership_plans_sort_order_idx" ON "membership_plans" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "membership_plans_is_popular_idx" ON "membership_plans" USING btree ("is_popular");--> statement-breakpoint
CREATE INDEX "payment_records_user_id_idx" ON "payment_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payment_records_status_idx" ON "payment_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_records_stripe_payment_intent_idx" ON "payment_records" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "payment_records_paid_at_idx" ON "payment_records" USING btree ("paid_at");--> statement-breakpoint
CREATE INDEX "payment_records_created_at_idx" ON "payment_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_memberships_user_id_idx" ON "user_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_memberships_status_idx" ON "user_memberships" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_memberships_end_date_idx" ON "user_memberships" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "user_memberships_stripe_customer_idx" ON "user_memberships" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "user_memberships_auto_renew_idx" ON "user_memberships" USING btree ("auto_renew");--> statement-breakpoint
CREATE INDEX "user_usage_limits_user_id_idx" ON "user_usage_limits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_usage_limits_membership_id_idx" ON "user_usage_limits" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "user_usage_limits_reset_date_idx" ON "user_usage_limits" USING btree ("reset_date");--> statement-breakpoint
CREATE INDEX "users_is_active_idx" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "users_is_admin_idx" ON "users" USING btree ("is_admin");--> statement-breakpoint
CREATE INDEX "users_country_idx" ON "users" USING btree ("country");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "bio";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "total_learning_time";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "login_count";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "failed_login_attempts";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "account_locked_until";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "email_verified_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "phone_number";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "phone_verified_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "two_factor_enabled";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "backup_codes";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "timezone";