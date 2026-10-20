import { Controller, Get, Inject } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { DRIZZLE_DB, DrizzleDb } from "../../database/database.provider";
import { REDIS_CLIENT, CacheClient } from "../../common/redis/redis.provider";

@Controller()
export class HealthController {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDb,
    @Inject(REDIS_CLIENT) private readonly cache: CacheClient,
  ) {}

  @Get("health")
  async checkHealth() {
    let dbStatus = "ok";
    let redisStatus = "ok";

    try {
      await this.db.execute(sql`SELECT 1`);
    } catch {
      dbStatus = "disconnected";
    }

    try {
      await this.cache.set("health:ping", "pong", "EX", 10);
      const res = await this.cache.get("health:ping");
      if (res !== "pong") redisStatus = "degraded";
    } catch {
      redisStatus = "disconnected";
    }

    const isHealthy = dbStatus === "ok";

    return {
      status: isHealthy ? "healthy" : "unhealthy",
      service: "theia-web-api",
      timestamp: new Date().toISOString(),
      dependencies: {
        database: dbStatus,
        cache: redisStatus,
      },
    };
  }
}
