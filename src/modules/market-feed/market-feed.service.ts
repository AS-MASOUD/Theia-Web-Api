import { Injectable, Inject, Logger } from "@nestjs/common";
import { REDIS_CLIENT, CacheClient } from "../../common/redis/redis.provider";

export interface PublicMarketQuote {
  symbol: string;
  name: string;
  name_en?: string | null;
  category: string;
  price: number | null;
  unit: string;
  change_percent: number | null;
  price_toman: number | null;
  status: "live" | "stale" | "unavailable";
  updated_at: string | null;
}

export interface PublicMarketRatesResponse {
  gold_and_coins: PublicMarketQuote[];
  commodities: PublicMarketQuote[];
  currencies: PublicMarketQuote[];
  cryptocurrency: PublicMarketQuote[];
  usd_toman_rate: number | null;
  last_sync_time: string | null;
  sync_source: string;
  is_stale: boolean;
  status: "live" | "stale" | "unavailable";
  message?: string;
}

const SUPPORTED_CATALOG_DEFINITIONS = [
  { symbol: "IR_GOLD_18K", name: "طلای ۱۸ عیار", category: "gold_and_coins", unit: "تومان" },
  { symbol: "EMAMI_COIN", name: "سکه امامی", category: "gold_and_coins", unit: "تومان" },
  { symbol: "BAHAR_COIN", name: "سکه بهار آزادی", category: "gold_and_coins", unit: "تومان" },
  { symbol: "HALF_COIN", name: "نیم سکه", category: "gold_and_coins", unit: "تومان" },
  { symbol: "QUARTER_COIN", name: "ربع سکه", category: "gold_and_coins", unit: "تومان" },
  { symbol: "GERMI_COIN", name: "سکه گرمی", category: "gold_and_coins", unit: "تومان" },
  { symbol: "USD_IRR", name: "دلار آمریکا (آزاد)", category: "currencies", unit: "تومان" },
  { symbol: "EUR_IRR", name: "یورو", category: "currencies", unit: "تومان" },
  { symbol: "AED_IRR", name: "درهم امارات", category: "currencies", unit: "تومان" },
  { symbol: "GBP_IRR", name: "پوند انگلیس", category: "currencies", unit: "تومان" },
  { symbol: "TRY_IRR", name: "لیر ترکیه", category: "currencies", unit: "تومان" },
  { symbol: "BTC_USD", name: "بیت‌کوین", category: "cryptocurrency", unit: "دلار" },
  { symbol: "ETH_USD", name: "اتریوم", category: "cryptocurrency", unit: "دلار" },
  { symbol: "USDT_IRT", name: "تتر (تومانی)", category: "cryptocurrency", unit: "تومان" },
  { symbol: "SOL_USD", name: "سولانا", category: "cryptocurrency", unit: "دلار" },
  { symbol: "XAU_USD", name: "انس جهانی طلا", category: "commodities", unit: "دلار" },
  { symbol: "BRENT_CRUDE", name: "نفت خام برنت", category: "commodities", unit: "دلار" },
];

@Injectable()
export class MarketFeedService {
  private readonly logger = new Logger(MarketFeedService.name);
  private readonly cacheKey = "market:rates:public";
  private readonly fallbackKey = "market:rates:last_known_good";
  private readonly cacheTtlSeconds = 60; // 1 minute TTL

  constructor(@Inject(REDIS_CLIENT) private readonly cache: CacheClient) {}

  async getPublicRates(): Promise<PublicMarketRatesResponse> {
    // 1. Try Redis fresh cache
    try {
      const cached = await this.cache.get(this.cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...parsed,
          is_stale: false,
          status: "live",
        };
      }
    } catch (err: any) {
      this.logger.warn(`Failed reading fresh market cache: ${err.message}`);
    }

    // 2. Fetch from authoritative Financial API
    const financeApiUrl =
      process.env.FINANCE_API_INTERNAL_URL ||
      (process.env.NODE_ENV === "production"
        ? "http://theia-finance-api:8081"
        : "http://localhost:8000");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${financeApiUrl}/api/v1/assets/market/rates`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Financial API returned HTTP ${response.status}`);
      }

      const upstreamData = await response.json();
      const normalized = this.normalizeUpstreamRates(upstreamData);

      // Cache fresh result
      try {
        await this.cache.set(
          this.cacheKey,
          JSON.stringify(normalized),
          "EX",
          this.cacheTtlSeconds,
        );
        // Also persist as last known good with 7-day TTL
        await this.cache.set(
          this.fallbackKey,
          JSON.stringify(normalized),
          "EX",
          7 * 24 * 3600,
        );
      } catch (cacheErr: any) {
        this.logger.warn(`Failed writing market cache: ${cacheErr.message}`);
      }

      return {
        ...normalized,
        is_stale: false,
        status: "live",
      };
    } catch (fetchErr: any) {
      this.logger.warn(
        `Authoritative Financial API unreachable (${fetchErr.message}). Checking resilient fallback.`,
      );

      // 3. Fallback: Last known good quotes
      try {
        const lastGood = await this.cache.get(this.fallbackKey);
        if (lastGood) {
          const parsed = JSON.parse(lastGood);
          const markQuotesStale = (list: PublicMarketQuote[]) =>
            list.map((q) => ({ ...q, status: "stale" as const }));

          return {
            ...parsed,
            gold_and_coins: markQuotesStale(parsed.gold_and_coins || []),
            commodities: markQuotesStale(parsed.commodities || []),
            currencies: markQuotesStale(parsed.currencies || []),
            cryptocurrency: markQuotesStale(parsed.cryptocurrency || []),
            is_stale: true,
            status: "stale",
            message: "داده‌های بازار موقتاً بر اساس آخرین نرخ‌های ثبت‌شده معتبر نمایش داده می‌شوند.",
          };
        }
      } catch (fallbackErr: any) {
        this.logger.error(`Error reading fallback market cache: ${fallbackErr.message}`);
      }

      // 4. Fallback: Unavailable state (no fake prices)
      return this.getUnavailableCatalogState();
    }
  }

  private normalizeUpstreamRates(raw: any): PublicMarketRatesResponse {
    const normalizeList = (list: any[]): PublicMarketQuote[] => {
      if (!Array.isArray(list)) return [];
      return list.map((item) => ({
        symbol: item.symbol,
        name: item.name,
        name_en: item.name_en || null,
        category: item.category,
        price: item.price != null ? Number(item.price) : null,
        unit: item.unit || "تومان",
        change_percent: item.change_percent != null ? Number(item.change_percent) : null,
        price_toman: item.price_toman != null ? Number(item.price_toman) : null,
        status: "live",
        updated_at: item.updated_at || raw.last_sync_time || new Date().toISOString(),
      }));
    };

    return {
      gold_and_coins: normalizeList(raw.gold_and_coins),
      commodities: normalizeList(raw.commodities),
      currencies: normalizeList(raw.currencies),
      cryptocurrency: normalizeList(raw.cryptocurrency),
      usd_toman_rate: raw.usd_toman_rate != null ? Number(raw.usd_toman_rate) : null,
      last_sync_time: raw.last_sync_time || new Date().toISOString(),
      sync_source: raw.sync_source || "BRS API (via Financial API)",
      is_stale: false,
      status: "live",
    };
  }

  private getUnavailableCatalogState(): PublicMarketRatesResponse {
    const buildList = (cat: string) =>
      SUPPORTED_CATALOG_DEFINITIONS.filter((d) => d.category === cat).map((d) => ({
        symbol: d.symbol,
        name: d.name,
        name_en: null,
        category: d.category,
        price: null,
        unit: d.unit,
        change_percent: null,
        price_toman: null,
        status: "unavailable" as const,
        updated_at: null,
      }));

    return {
      gold_and_coins: buildList("gold_and_coins"),
      commodities: buildList("commodities"),
      currencies: buildList("currencies"),
      cryptocurrency: buildList("cryptocurrency"),
      usd_toman_rate: null,
      last_sync_time: null,
      sync_source: "Financial API (Unreachable)",
      is_stale: false,
      status: "unavailable",
      message: "نرخ‌های زنده بازار موقتاً در دسترس نیستند. اطلاعات به زودی به‌روزرسانی خواهند شد.",
    };
  }
}
