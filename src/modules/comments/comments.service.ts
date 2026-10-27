import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { eq, desc, and } from "drizzle-orm";
import { DRIZZLE_DB, DrizzleDb } from "../../database/database.provider";
import { comments, articles } from "../../database/schema";

export interface CreateCommentDto {
  userName: string;
  userEmail: string;
  content: string;
}

@Injectable()
export class CommentsService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async getApprovedForArticle(slug: string) {
    const [article] = await this.db
      .select({ id: articles.id })
      .from(articles)
      .where(and(eq(articles.slug, slug), eq(articles.isPublished, true)))
      .limit(1);

    if (!article) {
      throw new NotFoundException("مقاله مورد نظر یافت نشد.");
    }

    return this.db
      .select({
        id: comments.id,
        userName: comments.userName,
        content: comments.content,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .where(and(eq(comments.articleId, article.id), eq(comments.isApproved, true)))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(slug: string, dto: CreateCommentDto) {
    if (!dto.userName?.trim() || !dto.userEmail?.trim() || !dto.content?.trim()) {
      throw new BadRequestException("نام، ایمیل و متن دیدگاه الزامی است.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.userEmail.trim())) {
      throw new BadRequestException("فرمت نشانی ایمیل نامعتبر است.");
    }

    const [article] = await this.db
      .select({ id: articles.id })
      .from(articles)
      .where(and(eq(articles.slug, slug), eq(articles.isPublished, true)))
      .limit(1);

    if (!article) {
      throw new NotFoundException("مقاله مورد نظر یافت نشد.");
    }

    const [created] = await this.db
      .insert(comments)
      .values({
        articleId: article.id,
        userName: dto.userName.trim(),
        userEmail: dto.userEmail.toLowerCase().trim(),
        content: dto.content.trim(),
        isApproved: true, // Default auto-approved so users immediately see their comment
      })
      .returning();

    return {
      id: created.id,
      userName: created.userName,
      content: created.content,
      createdAt: created.createdAt,
      message: "دیدگاه شما با موفقیت ثبت شد.",
    };
  }

  async listAllAdmin(page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    return this.db
      .select({
        id: comments.id,
        articleId: comments.articleId,
        articleTitle: articles.title,
        articleSlug: articles.slug,
        userName: comments.userName,
        userEmail: comments.userEmail,
        content: comments.content,
        isApproved: comments.isApproved,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .leftJoin(articles, eq(comments.articleId, articles.id))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async toggleApproval(id: number, isApproved: boolean) {
    const [updated] = await this.db
      .update(comments)
      .set({ isApproved })
      .where(eq(comments.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException("دیدگاه مورد نظر یافت نشد.");
    }

    return updated;
  }

  async deleteComment(id: number) {
    const [deleted] = await this.db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning({ id: comments.id });

    if (!deleted) {
      throw new NotFoundException("دیدگاه مورد نظر جهت حذف یافت نشد.");
    }

    return { success: true, deletedId: deleted.id };
  }
}
