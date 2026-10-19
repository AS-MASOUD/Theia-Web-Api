import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { FaqService, CreateFaqDto } from "./faq.service";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller()
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get("public/faq")
  async listPublic(@Query("category") category?: string) {
    return this.faqService.listPublished(category);
  }

  @Get("admin/faq")
  @UseGuards(AdminAuthGuard)
  async listAdmin() {
    return this.faqService.listAdmin();
  }

  @Post("admin/faq")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin", "editor")
  async createFaq(@Body() body: CreateFaqDto) {
    return this.faqService.create(body);
  }

  @Put("admin/faq/:id")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin", "editor")
  async updateFaq(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: Partial<CreateFaqDto>,
  ) {
    return this.faqService.update(id, body);
  }

  @Delete("admin/faq/:id")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin")
  async deleteFaq(@Param("id", ParseIntPipe) id: number) {
    return this.faqService.delete(id);
  }
}
