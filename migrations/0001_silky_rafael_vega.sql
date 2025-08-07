CREATE TABLE "acs_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"section" varchar(100),
	"subsection" varchar(100),
	"level" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "acs_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "analysis_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"session_name" varchar(255),
	"total_questions" integer DEFAULT 0,
	"correct_answers" integer DEFAULT 0,
	"incorrect_answers" integer DEFAULT 0,
	"overall_score" real DEFAULT 0,
	"analysis_results" jsonb,
	"recommendations" jsonb,
	"processed_file_ids" jsonb,
	"session_status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processed_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"extracted_text" text,
	"processing_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"processing_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"question_number" integer,
	"question_text" text,
	"user_answer" varchar(10),
	"correct_answer" varchar(10),
	"is_correct" integer,
	"acs_code_id" integer,
	"difficulty" varchar(20),
	"time_spent" integer,
	"confidence_level" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"acs_code_id" integer NOT NULL,
	"total_attempts" integer DEFAULT 0,
	"correct_attempts" integer DEFAULT 0,
	"mastery_level" real DEFAULT 0,
	"last_practiced" timestamp,
	"study_recommendations" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "question_analysis" ADD CONSTRAINT "question_analysis_session_id_analysis_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."analysis_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_analysis" ADD CONSTRAINT "question_analysis_file_id_processed_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."processed_files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_analysis" ADD CONSTRAINT "question_analysis_acs_code_id_acs_codes_id_fk" FOREIGN KEY ("acs_code_id") REFERENCES "public"."acs_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_acs_code_id_acs_codes_id_fk" FOREIGN KEY ("acs_code_id") REFERENCES "public"."acs_codes"("id") ON DELETE no action ON UPDATE no action;