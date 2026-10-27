ALTER TABLE "website_market_signals" ALTER COLUMN "signal_type" SET DEFAULT 'BUY';--> statement-breakpoint
ALTER TABLE "website_market_signals" ALTER COLUMN "entry_price" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "website_market_signals" ALTER COLUMN "target_price" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "website_market_signals" ALTER COLUMN "stop_loss" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "website_market_signals" ALTER COLUMN "risk_reward" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "website_market_signals" ALTER COLUMN "risk_reward" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "website_market_signals" ALTER COLUMN "risk_level" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "website_market_signals" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "website_market_signals" ADD COLUMN "trend_bias" varchar(50) DEFAULT 'BULLISH' NOT NULL;--> statement-breakpoint
ALTER TABLE "website_market_signals" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "website_market_signals" ADD COLUMN "fundamental_data" text;--> statement-breakpoint
ALTER TABLE "website_market_signals" ADD COLUMN "indexes_summary" text;--> statement-breakpoint
ALTER TABLE "website_market_signals" ADD COLUMN "key_levels" text;--> statement-breakpoint
ALTER TABLE "website_market_signals" ADD COLUMN "reading_time" varchar(50) DEFAULT '۴ دقیقه';