CREATE TABLE "website_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"content" text NOT NULL,
	"reading_time" varchar(50) DEFAULT '۵ دقیقه',
	"author_name" varchar(100) DEFAULT 'تیم تحلیل تیا',
	"author_role" varchar(100) DEFAULT 'تحلیل‌گر ارشد',
	"category_id" integer,
	"is_published" boolean DEFAULT true NOT NULL,
	"views_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "website_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "website_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_fa" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "website_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "website_contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"client_ip" varchar(64),
	"status" varchar(50) DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_faq_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(100) NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_releases" (
	"id" serial PRIMARY KEY NOT NULL,
	"version" varchar(50) NOT NULL,
	"release_date" varchar(50) NOT NULL,
	"summary" text NOT NULL,
	"changes_json" text NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "website_releases_version_unique" UNIQUE("version")
);
--> statement-breakpoint
CREATE TABLE "website_admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(50) DEFAULT 'editor' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "website_admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "website_articles" ADD CONSTRAINT "website_articles_category_id_website_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."website_categories"("id") ON DELETE no action ON UPDATE no action;