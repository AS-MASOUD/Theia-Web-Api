import { Module } from "@nestjs/common";
import { MarketSignalsService } from "./market-signals.service";
import { MarketSignalsController } from "./market-signals.controller";
import { AdminModule } from "../admin/admin.module";

@Module({
  imports: [AdminModule],
  controllers: [MarketSignalsController],
  providers: [MarketSignalsService],
  exports: [MarketSignalsService],
})
export class MarketSignalsModule {}
