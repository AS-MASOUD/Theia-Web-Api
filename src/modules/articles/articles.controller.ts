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
  BadRequestException,
  Res,
} from "@nestjs/common";
import {
  ArticlesService,
  CreateArticleDto,
  UpdateArticleDto,
} from "./articles.service";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

@Controller()
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  // --- Public Endpoints ---
  @Get("public/articles")
  async listPublic(
    @Query("category") categorySlug?: string,
    @Query("type") articleType?: "blog" | "news",
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.articlesService.listPublished({
      categorySlug,
      articleType,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get("public/articles/:slug")
  async getBySlug(@Param("slug") slug: string) {
    return this.articlesService.getPublishedBySlug(slug);
  }

  // --- Public Uploads Server ---
  @Get("public/uploads/:filename")
  async getUploadedFile(@Param("filename") filename: string, @Res() res: any) {
    // Sanitize filename to prevent directory traversal
    const safeName = path.basename(filename);
    const filePath = path.join(UPLOADS_DIR, safeName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send({ message: "فایل یافت نشد" });
    }

    const ext = path.extname(safeName).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".gif": "image/gif",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.header("Content-Type", contentType);
    res.header("Cache-Control", "public, max-age=31536000, immutable");
    const stream = fs.createReadStream(filePath);
    return res.send(stream);
  }

  // --- Admin Endpoints ---
  @Get("admin/articles")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin", "editor")
  async listAdmin(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("type") articleType?: "blog" | "news",
  ) {
    return this.articlesService.listAllAdmin(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
      articleType,
    );
  }

  @Get("admin/articles/:id")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin", "editor")
  async getArticleById(@Param("id", ParseIntPipe) id: number) {
    return this.articlesService.getByIdAdmin(id);
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

  // Image upload for rich text editor and article covers
  @Post("admin/upload")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin", "editor", "trader")
  async uploadImage(@Body() body: { dataUrl?: string; filename?: string }) {
    if (!body?.dataUrl || typeof body.dataUrl !== "string") {
      throw new BadRequestException("فرمت تصویر نامعتبر است (dataUrl الزامی است).");
    }

    const matches = body.dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) {
      throw new BadRequestException("فرمت دیتای تصویر نامعتبر است. فرمت معتبر base64 ارسال نمایید.");
    }

    const rawExt = matches[1].toLowerCase();
    const ext = rawExt === "jpeg" ? "jpg" : rawExt;
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    if (buffer.length > 5 * 1024 * 1024) {
      throw new BadRequestException("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.");
    }

    const randomSuffix = crypto.randomBytes(8).toString("hex");
    const safeFilename = `img_${Date.now()}_${randomSuffix}.${ext}`;
    const destinationPath = path.join(UPLOADS_DIR, safeFilename);

    fs.writeFileSync(destinationPath, buffer);

    return {
      success: true,
      filename: safeFilename,
      url: `/api/v1/public/uploads/${safeFilename}`,
    };
  }
}
