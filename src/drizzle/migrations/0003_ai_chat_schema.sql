CREATE TABLE IF NOT EXISTS "ai_chat_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" varchar(255) NOT NULL,
  "title" varchar(120),
  "summary" text,
  "system_prompt" text,
  "model_id" varchar(100) DEFAULT 'openai/gpt-4o' NOT NULL,
  "locale" varchar(10),
  "visibility" varchar(20) DEFAULT 'private' NOT NULL,
  "mode" varchar(30) DEFAULT 'chat' NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "last_message_at" timestamp,
  "archived_at" timestamp,
  "deleted_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "ai_chat_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "ai_chat_sessions_user_id_idx" ON "ai_chat_sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "ai_chat_sessions_model_id_idx" ON "ai_chat_sessions" ("model_id");
CREATE INDEX IF NOT EXISTS "ai_chat_sessions_last_message_idx" ON "ai_chat_sessions" ("last_message_at");
CREATE INDEX IF NOT EXISTS "ai_chat_sessions_visibility_idx" ON "ai_chat_sessions" ("visibility");

CREATE TABLE IF NOT EXISTS "ai_chat_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "author_id" varchar(255),
  "role" varchar(30) NOT NULL,
  "status" varchar(30) DEFAULT 'completed' NOT NULL,
  "content" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "text" text,
  "tokens" integer,
  "error_message" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "ai_chat_messages_session_id_ai_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "ai_chat_sessions"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "ai_chat_messages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "ai_chat_messages_session_id_idx" ON "ai_chat_messages" ("session_id");
CREATE INDEX IF NOT EXISTS "ai_chat_messages_author_id_idx" ON "ai_chat_messages" ("author_id");
CREATE INDEX IF NOT EXISTS "ai_chat_messages_role_idx" ON "ai_chat_messages" ("role");
CREATE INDEX IF NOT EXISTS "ai_chat_messages_created_at_idx" ON "ai_chat_messages" ("created_at");

CREATE TABLE IF NOT EXISTS "ai_chat_attachments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "message_id" uuid,
  "user_id" varchar(255),
  "kind" varchar(30) DEFAULT 'file' NOT NULL,
  "name" varchar(255) NOT NULL,
  "content_type" varchar(100) NOT NULL,
  "size_bytes" bigint DEFAULT 0 NOT NULL,
  "storage_key" varchar(512) NOT NULL,
  "url" text NOT NULL,
  "preview_url" text,
  "checksum" varchar(128),
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "ai_chat_attachments_session_id_ai_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "ai_chat_sessions"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "ai_chat_attachments_message_id_ai_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "ai_chat_messages"("id") ON DELETE set null ON UPDATE no action,
  CONSTRAINT "ai_chat_attachments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "ai_chat_attachments_session_id_idx" ON "ai_chat_attachments" ("session_id");
CREATE INDEX IF NOT EXISTS "ai_chat_attachments_message_id_idx" ON "ai_chat_attachments" ("message_id");
CREATE INDEX IF NOT EXISTS "ai_chat_attachments_user_id_idx" ON "ai_chat_attachments" ("user_id");
CREATE INDEX IF NOT EXISTS "ai_chat_attachments_kind_idx" ON "ai_chat_attachments" ("kind");

CREATE TABLE IF NOT EXISTS "ai_chat_file_chunks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "attachment_id" uuid NOT NULL,
  "chunk_index" integer NOT NULL,
  "content" text NOT NULL,
  "token_count" integer DEFAULT 0 NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "ai_chat_file_chunks_attachment_id_ai_chat_attachments_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "ai_chat_attachments"("id") ON DELETE cascade ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "ai_chat_file_chunks_attachment_id_idx" ON "ai_chat_file_chunks" ("attachment_id");
CREATE UNIQUE INDEX IF NOT EXISTS "ai_chat_file_chunks_order_idx" ON "ai_chat_file_chunks" ("attachment_id", "chunk_index");

CREATE TABLE IF NOT EXISTS "ai_chat_embeddings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "chunk_id" uuid NOT NULL,
  "model_id" varchar(100) NOT NULL,
  "embedding" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "dimensions" integer NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "ai_chat_embeddings_chunk_id_ai_chat_file_chunks_id_fk" FOREIGN KEY ("chunk_id") REFERENCES "ai_chat_file_chunks"("id") ON DELETE cascade ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "ai_chat_embeddings_chunk_id_idx" ON "ai_chat_embeddings" ("chunk_id");
CREATE INDEX IF NOT EXISTS "ai_chat_embeddings_model_id_idx" ON "ai_chat_embeddings" ("model_id");
