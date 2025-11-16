CREATE TABLE "speaking_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "speaking_type" NOT NULL,
	"title" text NOT NULL,
	"template_text" text NOT NULL,
	"audio_url" text,
	"score_range" text NOT NULL,
	"difficulty" "difficulty_level" DEFAULT 'Medium' NOT NULL,
	"is_recommended" boolean DEFAULT false NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "speaking_attempts" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_speaking_templates_type" ON "speaking_templates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_speaking_templates_recommended" ON "speaking_templates" USING btree ("is_recommended");--> statement-breakpoint
CREATE INDEX "idx_speaking_attempts_public" ON "speaking_attempts" USING btree ("is_public");