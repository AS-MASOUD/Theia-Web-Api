import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { CommentsService, CreateCommentDto } from "./comments.service";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // Public: View approved comments on a blog
  @Get("public/articles/:slug/comments")
  async getArticleComments(@Param("slug") slug: string) {
    return this.commentsService.getApprovedForArticle(slug);
  }

  // Public: Post a comment on a blog
  @Post("public/articles/:slug/comments")
  async postArticleComment(
    @Param("slug") slug: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(slug, dto);
  }

  // Admin/Editor: View all comments for moderation
  @Get("admin/comments")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin", "editor")
  async listAdminComments(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.commentsService.listAllAdmin(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  // Admin/Editor: Toggle approval status
  @Patch("admin/comments/:id/status")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin", "editor")
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body("isApproved") isApproved: boolean,
  ) {
    return this.commentsService.toggleApproval(id, Boolean(isApproved));
  }

  // Admin/Editor: Delete comment
  @Delete("admin/comments/:id")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin", "editor")
  async deleteComment(@Param("id", ParseIntPipe) id: number) {
    return this.commentsService.deleteComment(id);
  }
}
