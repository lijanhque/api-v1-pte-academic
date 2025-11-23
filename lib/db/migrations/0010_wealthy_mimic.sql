ALTER TABLE "speaking_questions" ADD COLUMN "reference_audio_url_us" text;--> statement-breakpoint
ALTER TABLE "speaking_questions" ADD COLUMN "reference_audio_url_uk" text;--> statement-breakpoint
ALTER TABLE "speaking_questions" ADD COLUMN "appearance_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "speaking_questions" ADD COLUMN "external_id" text;--> statement-breakpoint
ALTER TABLE "speaking_questions" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "speaking_questions" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_speaking_questions_external_id" ON "speaking_questions" USING btree ("external_id");