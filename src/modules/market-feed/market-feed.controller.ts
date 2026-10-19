import { Controller, Get } from "@nestjs/common";
import { MarketFeedService, PublicMarketRatesResponse } from "./market-feed.service";

@Controller("public/market")
export class MarketFeedController {
  constructor(private readonly marketFeedService: MarketFeedService) {}

  @Get("rates")
  async getRates(): Promise<PublicMarketRatesResponse> {
    return this.marketFeedService.getPublicRates();
  }
}
