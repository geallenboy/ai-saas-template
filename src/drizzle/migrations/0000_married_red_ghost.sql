CREATE TABLE "membership_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"name_de" varchar(100),
	"description" text,
	"description_de" text,
	"price_usd_monthly" numeric(10, 2) NOT NULL,
	"price_eur_monthly" numeric(10, 2),
	"price_usd_yearly" numeric(10, 2),
	"price_eur_yearly" numeric(10, 2),
	"stripe_price_id_usd_monthly" varchar(255),
	"stripe_price_id_eur_monthly" varchar(255),
	"stripe_price_id_usd_yearly" varchar(255),
	"stripe_price_id_eur_yearly" varchar(255),
	"features" json DEFAULT '[]'::json NOT NULL,
	"features_de" json DEFAULT '[]'::json,
	"max_use_cases" integer DEFAULT -1,
	"max_tutorials" integer DEFAULT -1,
	"max_blogs" integer DEFAULT -1,
	"monthly_duration_days" integer DEFAULT 30,
	"yearly_duration_days" integer DEFAULT 365,
	"is_active" boolean DEFAULT true,
	"is_popular" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"membership_id" uuid,
	"stripe_payment_intent_id" varchar(255),
	"stripe_checkout_session_id" varchar(255),
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"status" varchar(50) NOT NULL,
	"payment_method" varchar(50),
	"plan_name" varchar(100) NOT NULL,
	"duration_type" varchar(20) NOT NULL,
	"membership_duration_days" integer NOT NULL,
	"description" text,
	"metadata" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
	"stripe_payment_intent_id" varchar(255),
	"stripe_customer_id" varchar(255),
	"payment_method" varchar(50),
	"locale" varchar(10),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_usage_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"membership_id" uuid,
	"used_use_cases" integer DEFAULT 0,
	"used_tutorials" integer DEFAULT 0,
	"used_blogs" integer DEFAULT 0,
	"last_checked_at" timestamp DEFAULT now(),
	"reset_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_usage_limits_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "sync_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"sync_type" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"changes_made" jsonb,
	"error_message" text,
	"sync_duration_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"permission_name" varchar(100) NOT NULL,
	"resource_type" varchar(50),
	"resource_id" text,
	"granted_by" text,
	"granted_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role_name" varchar(50) NOT NULL,
	"assigned_by" text,
	"assigned_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"session_token" text NOT NULL,
	"clerk_session_id" text,
	"device_info" jsonb,
	"ip_address" text,
	"user_agent" text,
	"expires_at" timestamp NOT NULL,
	"last_activity" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"bio" text,
	"preferences" jsonb,
	"total_learning_time" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_admin" boolean DEFAULT false,
	"last_login_at" timestamp,
	"login_count" integer DEFAULT 0,
	"failed_login_attempts" integer DEFAULT 0,
	"account_locked_until" timestamp,
	"email_verified_at" timestamp,
	"phone_number" varchar(20),
	"phone_verified_at" timestamp,
	"two_factor_enabled" boolean DEFAULT false,
	"backup_codes" jsonb,
	"timezone" varchar(50) DEFAULT 'UTC',
	"locale" varchar(10) DEFAULT 'de-DE',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_membership_id_user_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."user_memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_plan_id_membership_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_usage_limits" ADD CONSTRAINT "user_usage_limits_membership_id_user_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."user_memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sync_logs_user_id_idx" ON "sync_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sync_logs_type_idx" ON "sync_logs" USING btree ("sync_type");--> statement-breakpoint
CREATE INDEX "sync_logs_status_idx" ON "sync_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sync_logs_created_idx" ON "sync_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_permissions_user_id_idx" ON "user_permissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_permissions_permission_idx" ON "user_permissions" USING btree ("permission_name");--> statement-breakpoint
CREATE INDEX "user_permissions_resource_idx" ON "user_permissions" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "user_permissions_active_idx" ON "user_permissions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "user_permissions_expires_idx" ON "user_permissions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "user_roles_user_id_idx" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_roles_role_idx" ON "user_roles" USING btree ("role_name");--> statement-breakpoint
CREATE INDEX "user_roles_active_idx" ON "user_roles" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "user_roles_expires_idx" ON "user_roles" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_sessions_token_idx" ON "user_sessions" USING btree ("session_token");--> statement-breakpoint
CREATE INDEX "user_sessions_expires_idx" ON "user_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "user_sessions_activity_idx" ON "user_sessions" USING btree ("last_activity");--> statement-breakpoint
CREATE INDEX "user_sessions_active_idx" ON "user_sessions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_last_login_idx" ON "users" USING btree ("last_login_at");--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone_number");