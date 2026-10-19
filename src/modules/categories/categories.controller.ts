import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { CategoriesService, CreateCategoryDto } from "./categories.service";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get("public/categories")
  async listPublic() {
    return this.categoriesService.list();
  }

  @Get("public/categories/:slug")
  async getBySlug(@Param("slug") slug: string) {
    return this.categoriesService.getBySlug(slug);
  }

  @Post("admin/categories")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin")
  async createCategory(@Body() body: CreateCategoryDto) {
    return this.categoriesService.create(body);
  }
}
