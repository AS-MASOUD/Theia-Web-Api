import { Module } from "@nestjs/common";
import { FaqService } from "./faq.service";
import { FaqController } from "./faq.controller";
import { AdminModule } from "../admin/admin.module";

@Module({
  imports: [AdminModule],
  controllers: [FaqController],
  providers: [FaqService],
  exports: [FaqService],
})
export class FaqModule {}
