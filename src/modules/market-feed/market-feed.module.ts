import { Module } from "@nestjs/common";
import { MarketFeedService } from "./market-feed.service";
import { MarketFeedController } from "./market-feed.controller";

@Module({
  controllers: [MarketFeedController],
  providers: [MarketFeedService],
  exports: [MarketFeedService],
})
export class MarketFeedModule {}
