import { pgTable, serial, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const categories = pgTable("website_categories", {
  id: serial("id").primaryKey(),
  nameFa: varchar("name_fa", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const articles = pgTable("website_articles", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  articleType: varchar("article_type", { length: 50 }).default("blog").notNull(), // 'blog' | 'news'
  coverImage: text("cover_image"),
  tags: text("tags"),
  readingTime: varchar("reading_time", { length: 50 }).default("۵ دقیقه"),
  authorName: varchar("author_name", { length: 100 }).default("تیم تحلیل تیا"),
  authorRole: varchar("author_role", { length: 100 }).default("تحلیل‌گر ارشد"),
  categoryId: integer("category_id").references(() => categories.id),
  isPublished: boolean("is_published").default(true).notNull(),
  viewsCount: integer("views_count").default(0).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const comments = pgTable("website_comments", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id")
    .references(() => articles.id, { onDelete: "cascade" })
    .notNull(),
  userName: varchar("user_name", { length: 150 }).notNull(),
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  content: text("content").notNull(),
  isApproved: boolean("is_approved").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const contactMessages = pgTable("website_contact_messages", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  clientIp: varchar("client_ip", { length: 64 }),
  status: varchar("status", { length: 50 }).default("new").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const faqItems = pgTable("website_faq_items", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const releases = pgTable("website_releases", {
  id: serial("id").primaryKey(),
  version: varchar("version", { length: 50 }).notNull().unique(),
  releaseDate: varchar("release_date", { length: 50 }).notNull(),
  summary: text("summary").notNull(),
  changesJson: text("changes_json").notNull(), // JSON array of string changes
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const websiteAdmins = pgTable("website_admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: varchar("full_name", { length: 150 }).default("کاربر سیستم").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  role: varchar("role", { length: 50 }).default("editor").notNull(), // 'admin' | 'editor' | 'trader'
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const marketSignals = pgTable("website_market_signals", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  marketCategory: varchar("market_category", { length: 50 }).notNull(), // 'gold_coin' | 'currency' | 'crypto' | 'commodity'
  signalType: varchar("signal_type", { length: 50 }).default("BUY").notNull(), // 'BUY' | 'SELL' | 'HOLD' | 'NEUTRAL'
  trendBias: varchar("trend_bias", { length: 50 }).default("BULLISH").notNull(), // 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  timeframe: varchar("timeframe", { length: 50 }).default("1D").notNull(), // '1H' | '4H' | '1D' | '1W'
  summary: text("summary"), // Short executive summary of the chart
  chartImageUrl: text("chart_image_url"),
  analysisText: text("analysis_text").notNull(), // Deep editorial analysis (like blog)
  fundamentalData: text("fundamental_data"), // Macro data (inflation, interest rate, DXY, volume)
  indexesSummary: text("indexes_summary"), // Key market indexes (Fear & Greed, VIX, Dominance, RSI)
  keyLevels: text("key_levels"), // Technical support / resistance zones
  readingTime: varchar("reading_time", { length: 50 }).default("۴ دقیقه"),
  
  // Optional legacy fields kept for backwards compatibility (nullable)
  entryPrice: varchar("entry_price", { length: 100 }),
  targetPrice: varchar("target_price", { length: 100 }),
  stopLoss: varchar("stop_loss", { length: 100 }),
  riskReward: varchar("risk_reward", { length: 50 }),
  riskLevel: varchar("risk_level", { length: 50 }).default("MEDIUM"),
  status: varchar("status", { length: 50 }).default("ACTIVE"),

  traderId: integer("trader_id").references(() => websiteAdmins.id, { onDelete: "set null" }),
  traderName: varchar("trader_name", { length: 100 }).notNull(),
  traderRole: varchar("trader_role", { length: 100 }).default("معامله‌گر و تحلیل‌گر ارشد").notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  viewsCount: integer("views_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
