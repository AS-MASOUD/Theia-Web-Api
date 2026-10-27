CREATE TABLE "website_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"user_name" varchar(150) NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"is_approved" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_market_signals" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"symbol" varchar(50) NOT NULL,
	"market_category" varchar(50) NOT NULL,
	"signal_type" varchar(50) NOT NULL,
	"timeframe" varchar(50) DEFAULT '1D' NOT NULL,
	"entry_price" varchar(100) NOT NULL,
	"target_price" varchar(100) NOT NULL,
	"stop_loss" varchar(100) NOT NULL,
	"risk_reward" varchar(50) DEFAULT '1:2' NOT NULL,
	"risk_level" varchar(50) DEFAULT 'MEDIUM' NOT NULL,
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"chart_image_url" text,
	"analysis_text" text NOT NULL,
	"trader_id" integer,
	"trader_name" varchar(100) NOT NULL,
	"trader_role" varchar(100) DEFAULT 'معامله‌گر و تحلیل‌گر ارشد' NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"views_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "website_articles" ADD COLUMN "article_type" varchar(50) DEFAULT 'blog' NOT NULL;--> statement-breakpoint
ALTER TABLE "website_articles" ADD COLUMN "cover_image" text;--> statement-breakpoint
ALTER TABLE "website_articles" ADD COLUMN "tags" text;--> statement-breakpoint
ALTER TABLE "website_admins" ADD COLUMN "full_name" varchar(150) DEFAULT 'کاربر سیستم' NOT NULL;--> statement-breakpoint
ALTER TABLE "website_admins" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "website_admins" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "website_comments" ADD CONSTRAINT "website_comments_article_id_website_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."website_articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_market_signals" ADD CONSTRAINT "website_market_signals_trader_id_website_admins_id_fk" FOREIGN KEY ("trader_id") REFERENCES "public"."website_admins"("id") ON DELETE set null ON UPDATE no action;