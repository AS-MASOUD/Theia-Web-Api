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
import {
  ArticlesService,
  CreateArticleDto,
  UpdateArticleDto,
} from "./articles.service";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller()
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  // --- Public Endpoints ---
  @Get("public/articles")
  async listPublic(
    @Query("category") categorySlug?: string,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.articlesService.listPublished({
      categorySlug,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get("public/articles/:slug")
  async getBySlug(@Param("slug") slug: string) {
    return this.articlesService.getPublishedBySlug(slug);
  }

  // --- Admin Endpoints ---
  @Get("admin/articles")
  @UseGuards(AdminAuthGuard)
  async listAdmin(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.articlesService.listAllAdmin(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post("admin/articles")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin", "editor")
  async createArticle(@Body() body: CreateArticleDto) {
    return this.articlesService.create(body);
  }

  @Put("admin/articles/:id")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin", "editor")
  async updateArticle(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, body);
  }

  @Delete("admin/articles/:id")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin")
  async deleteArticle(@Param("id", ParseIntPipe) id: number) {
    return this.articlesService.delete(id);
  }
}
