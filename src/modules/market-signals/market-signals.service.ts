import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { eq, desc, and, sql } from "drizzle-orm";
import { DRIZZLE_DB, DrizzleDb } from "../../database/database.provider";
import { marketSignals } from "../../database/schema";

export interface CreateSignalDto {
  title: string;
  symbol: string;
  marketCategory: "gold_coin" | "currency" | "crypto" | "commodity";
  trendBias?: "BULLISH" | "BEARISH" | "NEUTRAL";
  signalType?: "BUY" | "SELL" | "HOLD" | "NEUTRAL";
  timeframe?: string; // e.g. "1H", "4H", "1D", "1W"
  summary?: string;
  chartImageUrl?: string;
  analysisText: string;
  fundamentalData?: string;
  indexesSummary?: string;
  keyLevels?: string;
  readingTime?: string;

  // Optional legacy fields (no longer mandatory)
  entryPrice?: string;
  targetPrice?: string;
  stopLoss?: string;
  riskReward?: string;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  status?: "ACTIVE" | "TARGET_REACHED" | "STOPPED_OUT" | "EXPIRED" | "CANCELLED";

  traderName?: string;
  traderRole?: string;
  isPublished?: boolean;
}

export interface UpdateSignalDto {
  title?: string;
  symbol?: string;
  marketCategory?: "gold_coin" | "currency" | "crypto" | "commodity";
  trendBias?: "BULLISH" | "BEARISH" | "NEUTRAL";
  signalType?: "BUY" | "SELL" | "HOLD" | "NEUTRAL";
  timeframe?: string;
  summary?: string;
  chartImageUrl?: string;
  analysisText?: string;
  fundamentalData?: string;
  indexesSummary?: string;
  keyLevels?: string;
  readingTime?: string;
  status?: "ACTIVE" | "TARGET_REACHED" | "STOPPED_OUT" | "EXPIRED" | "CANCELLED";
  isPublished?: boolean;

  entryPrice?: string;
  targetPrice?: string;
  stopLoss?: string;
  riskReward?: string;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
}

@Injectable()
export class MarketSignalsService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async listPublic(params: {
    marketCategory?: string;
    symbol?: string;
    limit?: number;
  }) {
    const limit = Math.min(50, Math.max(1, params.limit || 20));
    const conditions = [eq(marketSignals.isPublished, true)];

    if (params.marketCategory && params.marketCategory !== "all") {
      conditions.push(eq(marketSignals.marketCategory, params.marketCategory));
    }

    if (params.symbol) {
      conditions.push(eq(marketSignals.symbol, params.symbol.toUpperCase()));
    }

    const whereClause = and(...conditions);

    return this.db
      .select({
        id: marketSignals.id,
        title: marketSignals.title,
        symbol: marketSignals.symbol,
        marketCategory: marketSignals.marketCategory,
        trendBias: marketSignals.trendBias,
        signalType: marketSignals.signalType,
        timeframe: marketSignals.timeframe,
        summary: marketSignals.summary,
        chartImageUrl: marketSignals.chartImageUrl,
        analysisText: marketSignals.analysisText,
        fundamentalData: marketSignals.fundamentalData,
        indexesSummary: marketSignals.indexesSummary,
        keyLevels: marketSignals.keyLevels,
        readingTime: marketSignals.readingTime,
        status: marketSignals.status,
        entryPrice: marketSignals.entryPrice,
        targetPrice: marketSignals.targetPrice,
        stopLoss: marketSignals.stopLoss,
        traderName: marketSignals.traderName,
        traderRole: marketSignals.traderRole,
        viewsCount: marketSignals.viewsCount,
        createdAt: marketSignals.createdAt,
      })
      .from(marketSignals)
      .where(whereClause)
      .orderBy(desc(marketSignals.createdAt))
      .limit(limit);
  }

  async getPublicById(id: number) {
    const [signal] = await this.db
      .select()
      .from(marketSignals)
      .where(and(eq(marketSignals.id, id), eq(marketSignals.isPublished, true)))
      .limit(1);

    if (!signal) {
      throw new NotFoundException("تحلیل چارت مورد نظر یافت نشد.");
    }

    // Increment view count in background
    this.db
      .update(marketSignals)
      .set({ viewsCount: sql`${marketSignals.viewsCount} + 1` })
      .where(eq(marketSignals.id, id))
      .catch(() => {});

    return signal;
  }

  async listAllAdmin(page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    return this.db
      .select({
        id: marketSignals.id,
        title: marketSignals.title,
        symbol: marketSignals.symbol,
        marketCategory: marketSignals.marketCategory,
        trendBias: marketSignals.trendBias,
        signalType: marketSignals.signalType,
        timeframe: marketSignals.timeframe,
        summary: marketSignals.summary,
        chartImageUrl: marketSignals.chartImageUrl,
        analysisText: marketSignals.analysisText,
        fundamentalData: marketSignals.fundamentalData,
        indexesSummary: marketSignals.indexesSummary,
        keyLevels: marketSignals.keyLevels,
        readingTime: marketSignals.readingTime,
        status: marketSignals.status,
        traderId: marketSignals.traderId,
        traderName: marketSignals.traderName,
        traderRole: marketSignals.traderRole,
        isPublished: marketSignals.isPublished,
        viewsCount: marketSignals.viewsCount,
        createdAt: marketSignals.createdAt,
        updatedAt: marketSignals.updatedAt,
      })
      .from(marketSignals)
      .orderBy(desc(marketSignals.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getByIdAdmin(id: number) {
    const [signal] = await this.db
      .select()
      .from(marketSignals)
      .where(eq(marketSignals.id, id))
      .limit(1);

    if (!signal) {
      throw new NotFoundException("تحلیل تحلیلی یافت نشد.");
    }

    return signal;
  }

  async createSignal(
    dto: CreateSignalDto,
    user: { sub: number; fullName?: string; email: string },
  ) {
    if (!dto.title?.trim() || !dto.symbol?.trim() || !dto.analysisText?.trim()) {
      throw new BadRequestException("عنوان، نماد و متن تحلیل چارت الزامی است.");
    }

    const [created] = await this.db
      .insert(marketSignals)
      .values({
        title: dto.title.trim(),
        symbol: dto.symbol.toUpperCase().trim(),
        marketCategory: dto.marketCategory || "gold_coin",
        trendBias: dto.trendBias || "BULLISH",
        signalType: dto.signalType || "BUY",
        timeframe: dto.timeframe || "1D",
        summary: dto.summary?.trim() || null,
        chartImageUrl: dto.chartImageUrl || null,
        analysisText: dto.analysisText.trim(),
        fundamentalData: dto.fundamentalData || null,
        indexesSummary: dto.indexesSummary || null,
        keyLevels: dto.keyLevels || null,
        readingTime: dto.readingTime || "۴ دقیقه",
        status: dto.status || "ACTIVE",
        entryPrice: dto.entryPrice || null,
        targetPrice: dto.targetPrice || null,
        stopLoss: dto.stopLoss || null,
        riskReward: dto.riskReward || null,
        riskLevel: dto.riskLevel || "MEDIUM",
        traderId: user.sub,
        traderName: dto.traderName || user.fullName || "معامله‌گر تیا",
        traderRole: dto.traderRole || "معامله‌گر و تحلیل‌گر ارشد",
        isPublished: dto.isPublished ?? true,
      })
      .returning();

    return created;
  }

  async updateSignal(
    id: number,
    dto: UpdateSignalDto,
    user: { sub: number; role: string },
  ) {
    const [existing] = await this.db
      .select()
      .from(marketSignals)
      .where(eq(marketSignals.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException("تحلیل مورد نظر یافت نشد.");
    }

    // If trader (not admin), enforce they can only modify their own analyses
    if (user.role === "trader" && existing.traderId !== user.sub) {
      throw new ForbiddenException("شما تنها مجاز به ویرایش تحلیل‌های ثبت‌شده توسط خود هستید.");
    }

    const [updated] = await this.db
      .update(marketSignals)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(marketSignals.id, id))
      .returning();

    return updated;
  }

  async deleteSignal(id: number, user: { sub: number; role: string }) {
    const [existing] = await this.db
      .select()
      .from(marketSignals)
      .where(eq(marketSignals.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException("تحلیل مورد نظر یافت نشد.");
    }

    if (user.role === "trader" && existing.traderId !== user.sub) {
      throw new ForbiddenException("شما تنها مجاز به حذف تحلیل‌های خود هستید.");
    }

    await this.db.delete(marketSignals).where(eq(marketSignals.id, id));
    return { success: true, message: "تحلیل با موفقیت حذف شد." };
  }
}
