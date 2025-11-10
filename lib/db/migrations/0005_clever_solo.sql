CREATE TABLE "pte_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"section" text NOT NULL,
	"question_type" text NOT NULL,
	"question" text NOT NULL,
	"question_data" text,
	"correct_answer" text,
	"points" integer DEFAULT 1,
	"order_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pte_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"test_type" text NOT NULL,
	"duration" text,
	"is_premium" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email_verified" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email_verified" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email_verified" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "target_score" integer;--> statement-breakpoint
ALTER TABLE "pte_questions" ADD CONSTRAINT "pte_questions_test_id_pte_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."pte_tests"("id") ON DELETE cascade ON UPDATE no action;