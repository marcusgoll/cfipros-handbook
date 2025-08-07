CREATE TABLE "page_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" varchar(255) NOT NULL,
	"user_id" varchar(255),
	"session_id" varchar(255),
	"feedback_type" varchar(20) NOT NULL,
	"helpful" integer,
	"emoji" varchar(20),
	"comment" text,
	"difficulty" varchar(20),
	"completion_time" integer,
	"user_agent" text,
	"ip_address" varchar(45),
	"referrer" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
