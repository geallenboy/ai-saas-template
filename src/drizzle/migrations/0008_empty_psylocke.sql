CREATE TABLE "ai_token_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"session_id" uuid,
	"model_id" varchar(100) NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"cost_usd" numeric(10, 6) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupon_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coupon_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"payment_record_id" uuid,
	"discount_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refund_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_record_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"requested_amount" numeric(10, 2) NOT NULL,
	"approved_amount" numeric(10, 2),
	"admin_id" varchar(255),
	"admin_note" text,
	"stripe_refund_id" varchar(255),
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "max_monthly_ai_tokens" integer DEFAULT 100000;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "max_monthly_ai_sessions" integer DEFAULT 100;--> statement-breakpoint
ALTER TABLE "user_usage_limits" ADD COLUMN "monthly_ai_tokens" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_usage_limits" ADD COLUMN "max_monthly_ai_tokens" integer DEFAULT -1;--> statement-breakpoint
ALTER TABLE "ai_token_usage" ADD CONSTRAINT "ai_token_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_token_usage" ADD CONSTRAINT "ai_token_usage_session_id_ai_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_chat_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_payment_record_id_payment_records_id_fk" FOREIGN KEY ("payment_record_id") REFERENCES "public"."payment_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_payment_record_id_payment_records_id_fk" FOREIGN KEY ("payment_record_id") REFERENCES "public"."payment_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_admin_id_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_token_usage_user_id_idx" ON "ai_token_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_token_usage_session_id_idx" ON "ai_token_usage" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "ai_token_usage_created_at_idx" ON "ai_token_usage" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ai_token_usage_model_id_idx" ON "ai_token_usage" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "coupon_usage_coupon_id_idx" ON "coupon_usage" USING btree ("coupon_id");--> statement-breakpoint
CREATE INDEX "coupon_usage_user_id_idx" ON "coupon_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "coupon_usage_coupon_user_idx" ON "coupon_usage" USING btree ("coupon_id","user_id");--> statement-breakpoint
CREATE INDEX "refund_requests_user_id_idx" ON "refund_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "refund_requests_status_idx" ON "refund_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "refund_requests_payment_record_idx" ON "refund_requests" USING btree ("payment_record_id");