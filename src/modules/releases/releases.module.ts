import { Module } from "@nestjs/common";
import { ReleasesService } from "./releases.service";
import { ReleasesController } from "./releases.controller";
import { AdminModule } from "../admin/admin.module";

@Module({
  imports: [AdminModule],
  controllers: [ReleasesController],
  providers: [ReleasesService],
  exports: [ReleasesService],
})
export class ReleasesModule {}
