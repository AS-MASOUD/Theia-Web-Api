import { Provider, Logger } from "@nestjs/common";
import Redis from "ioredis";

export const REDIS_CLIENT = "REDIS_CLIENT";

export interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<string | null>;
  del(key: string): Promise<number>;
}

class InMemoryCacheFallback implements CacheClient {
  private store = new Map<string, { value: string; expiresAt?: number }>();
  private logger = new Logger("InMemoryCacheFallback");

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<string | null> {
    const expiresAt = duration ? Date.now() + duration * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
    return "OK";
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }
}

export const redisProviders: Provider[] = [
  {
    provide: REDIS_CLIENT,
    useFactory: () => {
      const logger = new Logger("RedisClientFactory");
      const redisUrl = process.env.REDIS_URL;

      if (!redisUrl && process.env.NODE_ENV === "test") {
        logger.log("Using in-memory cache fallback for testing");
        return new InMemoryCacheFallback();
      }

      try {
        const client = new Redis(redisUrl || "redis://localhost:6379/1", {
          maxRetriesPerRequest: 1,
          retryStrategy(times) {
            if (times > 3) {
              return null; // Stop retrying after 3 attempts
            }
            return Math.min(times * 100, 1000);
          },
          lazyConnect: true,
        });

        client.connect().catch((err) => {
          logger.warn(`Redis connection failed (${err.message}). Falling back to in-memory cache.`);
        });

        client.on("error", (err) => {
          // Swallow unhandled error events to avoid crashing the process
          logger.warn(`Redis error: ${err.message}`);
        });

        return client;
      } catch (err: any) {
        logger.warn(`Redis initialization failed: ${err?.message}. Using in-memory fallback.`);
        return new InMemoryCacheFallback();
      }
    },
  },
];
