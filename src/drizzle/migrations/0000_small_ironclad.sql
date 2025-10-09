CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"user_email" varchar(255),
	"action" varchar(100) NOT NULL,
	"resource" varchar(100),
	"resource_id" varchar(255),
	"details" jsonb,
	"success" boolean DEFAULT true,
	"error_message" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"module" varchar(50),
	"severity" varchar(20) DEFAULT 'INFO',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"context" jsonb
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
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
	"name_zh" varchar(100),
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
CREATE TABLE "login_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"email" varchar(255) NOT NULL,
	"success" boolean NOT NULL,
	"failure_reason" varchar(100),
	"user_agent" text,
	"ip_address" varchar(45),
	"location" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"name_zh" varchar(100),
	"description" text,
	"description_zh" text,
	"price_usd_monthly" numeric(10, 2) NOT NULL,
	"price_cny_monthly" numeric(10, 2),
	"price_usd_yearly" numeric(10, 2),
	"price_cny_yearly" numeric(10, 2),
	"yearly_discount_percent" integer DEFAULT 0,
	"stripe_price_id_usd_monthly" varchar(255),
	"stripe_price_id_cny_monthly" varchar(255),
	"stripe_price_id_usd_yearly" varchar(255),
	"stripe_price_id_cny_yearly" varchar(255),
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"features_zh" jsonb DEFAULT '[]'::jsonb,
	"max_use_cases" integer DEFAULT -1,
	"max_tutorials" integer DEFAULT -1,
	"max_blogs" integer DEFAULT -1,
	"max_api_calls" integer DEFAULT -1,
	"permissions" jsonb DEFAULT '{"apiAccess":false,"customModels":false,"prioritySupport":false,"exportData":true,"bulkOperations":false,"advancedAnalytics":false}'::jsonb,
	"monthly_duration_days" integer DEFAULT 30,
	"yearly_duration_days" integer DEFAULT 365,
	"is_active" boolean DEFAULT true,
	"is_popular" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(200) NOT NULL,
	"title_zh" varchar(200),
	"message" text NOT NULL,
	"message_zh" text,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"membership_id" uuid,
	"stripe_payment_intent_id" varchar(255),
	"stripe_checkout_session_id" varchar(255),
	"stripe_invoice_id" varchar(255),
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"tax" numeric(10, 2) DEFAULT '0',
	"fees" numeric(10, 2) DEFAULT '0',
	"net_amount" numeric(10, 2),
	"status" varchar(50) NOT NULL,
	"payment_method" varchar(50),
	"plan_name" varchar(100) NOT NULL,
	"duration_type" varchar(20) NOT NULL,
	"membership_duration_days" integer NOT NULL,
	"coupon_code" varchar(50),
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"refund_amount" numeric(10, 2) DEFAULT '0',
	"refunded_at" timestamp,
	"refund_reason" text,
	"paid_at" timestamp,
	"failed_at" timestamp,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"device_name" varchar(100),
	"location" varchar(100),
	"last_active_at" timestamp DEFAULT now(),
	CONSTRAINT "session_token_unique" UNIQUE("token")
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
CREATE TABLE "user_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"plan_id" uuid NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"duration_type" varchar(20) DEFAULT 'monthly' NOT NULL,
	"duration_days" integer DEFAULT 30 NOT NULL,
	"purchase_amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"original_price" numeric(10, 2),
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"stripe_payment_intent_id" varchar(255),
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"auto_renew" boolean DEFAULT false,
	"next_renewal_date" timestamp,
	"renewal_attempts" integer DEFAULT 0,
	"payment_method" varchar(50),
	"locale" varchar(10),
	"source" varchar(50),
	"cancelled_at" timestamp,
	"cancel_reason" text,
	"cancelled_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_usage_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"membership_id" uuid,
	"used_use_cases" integer DEFAULT 0,
	"used_tutorials" integer DEFAULT 0,
	"used_blogs" integer DEFAULT 0,
	"used_api_calls" integer DEFAULT 0,
	"monthly_use_cases" integer DEFAULT 0,
	"monthly_tutorials" integer DEFAULT 0,
	"monthly_blogs" integer DEFAULT 0,
	"monthly_api_calls" integer DEFAULT 0,
	"last_checked_at" timestamp DEFAULT now(),
	"reset_date" timestamp,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_usage_limits_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"name" text,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" text,
	"display_username" text,
	"role" text DEFAULT 'user',
	"full_name" text,
	"is_admin" boolean DEFAULT false,
	"admin_level" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"locale" varchar(10) DEFAULT 'zh',
	"preferences" jsonb DEFAULT '{"theme":"light","language":"zh","currency":"CNY","timezone":"Asia/Shanghai"}'::jsonb,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_logs" ADD CONSTRAINT "login_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_membership_id_user_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."user_memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_configs" ADD CONSTRAINT "system_configs_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_plan_id_membership_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_usage_limits" ADD CONSTRAINT "user_usage_limits_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_usage_limits" ADD CONSTRAINT "user_usage_limits_membership_id_user_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."user_memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_severity_idx" ON "audit_logs" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "audit_logs_success_idx" ON "audit_logs" USING btree ("success");--> statement-breakpoint
CREATE INDEX "audit_logs_module_idx" ON "audit_logs" USING btree ("module");--> statement-breakpoint
CREATE INDEX "audit_logs_user_action_idx" ON "audit_logs" USING btree ("user_id","action");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_action_idx" ON "audit_logs" USING btree ("resource","action");--> statement-breakpoint
CREATE INDEX "audit_logs_time_range_idx" ON "audit_logs" USING btree ("created_at","user_id");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_provider_account_idx" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "account_provider_user_idx" ON "account" USING btree ("provider_id","user_id");--> statement-breakpoint
CREATE INDEX "api_keys_user_id_idx" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_keys_key_hash_idx" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "api_keys_active_idx" ON "api_keys" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "coupons_active_idx" ON "coupons" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "coupons_expires_at_idx" ON "coupons" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "login_logs_user_id_idx" ON "login_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "login_logs_email_idx" ON "login_logs" USING btree ("email");--> statement-breakpoint
CREATE INDEX "login_logs_created_at_idx" ON "login_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "login_logs_success_idx" ON "login_logs" USING btree ("success");--> statement-breakpoint
CREATE INDEX "membership_plans_name_idx" ON "membership_plans" USING btree ("name");--> statement-breakpoint
CREATE INDEX "membership_plans_is_active_idx" ON "membership_plans" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "membership_plans_sort_order_idx" ON "membership_plans" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "membership_plans_is_popular_idx" ON "membership_plans" USING btree ("is_popular");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "payment_records_user_id_idx" ON "payment_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payment_records_status_idx" ON "payment_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_records_stripe_payment_intent_idx" ON "payment_records" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "payment_records_paid_at_idx" ON "payment_records" USING btree ("paid_at");--> statement-breakpoint
CREATE INDEX "payment_records_created_at_idx" ON "payment_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "session_token_idx" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "session" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "system_configs_key_idx" ON "system_configs" USING btree ("key");--> statement-breakpoint
CREATE INDEX "system_configs_category_idx" ON "system_configs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "user_memberships_user_id_idx" ON "user_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_memberships_status_idx" ON "user_memberships" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_memberships_end_date_idx" ON "user_memberships" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "user_memberships_stripe_customer_idx" ON "user_memberships" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "user_memberships_auto_renew_idx" ON "user_memberships" USING btree ("auto_renew");--> statement-breakpoint
CREATE INDEX "user_usage_limits_user_id_idx" ON "user_usage_limits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_usage_limits_membership_id_idx" ON "user_usage_limits" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "user_usage_limits_reset_date_idx" ON "user_usage_limits" USING btree ("reset_date");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_is_active_idx" ON "user" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "user_is_admin_idx" ON "user" USING btree ("is_admin");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verification_value_idx" ON "verification" USING btree ("value");