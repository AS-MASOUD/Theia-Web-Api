import { Global, Module } from "@nestjs/common";
import { redisProviders, REDIS_CLIENT } from "./redis.provider";

@Global()
@Module({
  providers: [...redisProviders],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
