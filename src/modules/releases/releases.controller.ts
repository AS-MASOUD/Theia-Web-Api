import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { ReleasesService, CreateReleaseDto } from "./releases.service";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller()
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Get("public/releases")
  async listPublic() {
    return this.releasesService.listPublished();
  }

  @Get("admin/releases")
  @UseGuards(AdminAuthGuard)
  async listAdmin() {
    return this.releasesService.listAdmin();
  }

  @Post("admin/releases")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin", "editor")
  async createRelease(@Body() body: CreateReleaseDto) {
    return this.releasesService.create(body);
  }

  @Put("admin/releases/:id")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin", "editor")
  async updateRelease(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: Partial<CreateReleaseDto>,
  ) {
    return this.releasesService.update(id, body);
  }

  @Delete("admin/releases/:id")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin")
  async deleteRelease(@Param("id", ParseIntPipe) id: number) {
    return this.releasesService.delete(id);
  }
}
