import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { eq, desc, sql, and, ilike, or } from "drizzle-orm";
import { DRIZZLE_DB, DrizzleDb } from "../../database/database.provider";
import { articles, categories } from "../../database/schema";

export interface CreateArticleDto {
  slug: string;
  title: string;
  summary: string;
  content: string;
  articleType?: "blog" | "news";
  coverImage?: string;
  tags?: string;
  readingTime?: string;
  authorName?: string;
  authorRole?: string;
  categoryId?: number;
  isPublished?: boolean;
}

export interface UpdateArticleDto {
  title?: string;
  summary?: string;
  content?: string;
  articleType?: "blog" | "news";
  coverImage?: string;
  tags?: string;
  readingTime?: string;
  authorName?: string;
  authorRole?: string;
  categoryId?: number;
  isPublished?: boolean;
}

@Injectable()
export class ArticlesService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async listPublished(params: {
    categorySlug?: string;
    search?: string;
    articleType?: "blog" | "news";
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 10));
    const offset = (page - 1) * limit;

    const conditions = [eq(articles.isPublished, true)];

    if (params.articleType) {
      conditions.push(eq(articles.articleType, params.articleType));
    }

    if (params.search) {
      const q = `%${params.search}%`;
      conditions.push(or(ilike(articles.title, q), ilike(articles.summary, q)) as any);
    }

    if (params.categorySlug) {
      const [cat] = await this.db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, params.categorySlug))
        .limit(1);

      if (cat) {
        conditions.push(eq(articles.categoryId, cat.id));
      }
    }

    const whereClause = and(...conditions);

    const items = await this.db
      .select({
        id: articles.id,
        slug: articles.slug,
        title: articles.title,
        summary: articles.summary,
        articleType: articles.articleType,
        coverImage: articles.coverImage,
        tags: articles.tags,
        readingTime: articles.readingTime,
        authorName: articles.authorName,
        authorRole: articles.authorRole,
        isPublished: articles.isPublished,
        viewsCount: articles.viewsCount,
        publishedAt: articles.publishedAt,
        category: {
          id: categories.id,
          nameFa: categories.nameFa,
          slug: categories.slug,
        },
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(whereClause)
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(articles)
      .where(whereClause);

    return {
      items,
      total: countResult?.total || 0,
      page,
      limit,
      totalPages: Math.ceil((countResult?.total || 0) / limit),
    };
  }

  async getPublishedBySlug(slug: string) {
    const [article] = await this.db
      .select({
        id: articles.id,
        slug: articles.slug,
        title: articles.title,
        summary: articles.summary,
        content: articles.content,
        articleType: articles.articleType,
        coverImage: articles.coverImage,
        tags: articles.tags,
        readingTime: articles.readingTime,
        authorName: articles.authorName,
        authorRole: articles.authorRole,
        isPublished: articles.isPublished,
        viewsCount: articles.viewsCount,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        category: {
          id: categories.id,
          nameFa: categories.nameFa,
          slug: categories.slug,
        },
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(and(eq(articles.slug, slug), eq(articles.isPublished, true)))
      .limit(1);

    if (!article) {
      throw new NotFoundException("مقاله مورد نظر یافت نشد یا هنوز منتشر نشده است.");
    }

    // Fire and forget view count increment
    this.db
      .update(articles)
      .set({ viewsCount: sql`${articles.viewsCount} + 1` })
      .where(eq(articles.id, article.id))
      .catch(() => {});

    return article;
  }

  async listAllAdmin(page = 1, limit = 50, articleType?: "blog" | "news") {
    const offset = (page - 1) * limit;

    const conditions = [];
    if (articleType) {
      conditions.push(eq(articles.articleType, articleType));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await this.db
      .select({
        id: articles.id,
        slug: articles.slug,
        title: articles.title,
        summary: articles.summary,
        articleType: articles.articleType,
        coverImage: articles.coverImage,
        tags: articles.tags,
        readingTime: articles.readingTime,
        authorName: articles.authorName,
        isPublished: articles.isPublished,
        viewsCount: articles.viewsCount,
        publishedAt: articles.publishedAt,
        categoryId: articles.categoryId,
        categoryName: categories.nameFa,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(whereClause)
      .orderBy(desc(articles.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(articles)
      .where(whereClause);

    return {
      items,
      total: countResult?.total || 0,
      page,
      limit,
    };
  }

  async getByIdAdmin(id: number) {
    const [article] = await this.db
      .select()
      .from(articles)
      .where(eq(articles.id, id))
      .limit(1);

    if (!article) {
      throw new NotFoundException("مطلب مورد نظر یافت نشد.");
    }

    return article;
  }

  async create(dto: CreateArticleDto) {
    const existing = await this.db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, dto.slug))
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException("مقاله‌ای با این نامک (slug) قبلاً ثبت شده است.");
    }

    const [created] = await this.db
      .insert(articles)
      .values({
        slug: dto.slug,
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        articleType: dto.articleType || "blog",
        coverImage: dto.coverImage || null,
        tags: dto.tags || null,
        readingTime: dto.readingTime || "۵ دقیقه",
        authorName: dto.authorName || "تیم تحریریه تیا",
        authorRole: dto.authorRole || "کارشناس بازار",
        categoryId: dto.categoryId || null,
        isPublished: dto.isPublished ?? true,
      })
      .returning();

    return created;
  }

  async update(id: number, dto: UpdateArticleDto) {
    const [existing] = await this.db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException("مقاله مورد نظر یافت نشد.");
    }

    const [updated] = await this.db
      .update(articles)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, id))
      .returning();

    return updated;
  }

  async delete(id: number) {
    const [deleted] = await this.db
      .delete(articles)
      .where(eq(articles.id, id))
      .returning({ id: articles.id });

    if (!deleted) {
      throw new NotFoundException("مقاله مورد نظر جهت حذف یافت نشد.");
    }

    return { success: true, deletedId: deleted.id };
  }
}
