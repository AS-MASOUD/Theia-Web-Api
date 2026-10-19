import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { eq, sql } from "drizzle-orm";
import { DRIZZLE_DB, DrizzleDb } from "../../database/database.provider";
import { categories, articles } from "../../database/schema";

export interface CreateCategoryDto {
  nameFa: string;
  slug: string;
  description?: string;
  sortOrder?: number;
}

@Injectable()
export class CategoriesService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async list() {
    const list = await this.db
      .select({
        id: categories.id,
        nameFa: categories.nameFa,
        slug: categories.slug,
        description: categories.description,
        sortOrder: categories.sortOrder,
        createdAt: categories.createdAt,
        articleCount: sql<number>`count(${articles.id})::int`,
      })
      .from(categories)
      .leftJoin(articles, eq(articles.categoryId, categories.id))
      .groupBy(categories.id)
      .orderBy(categories.sortOrder);

    return list;
  }

  async getBySlug(slug: string) {
    const [category] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (!category) {
      throw new NotFoundException("دسته‌بندی مورد نظر یافت نشد.");
    }
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const [created] = await this.db
      .insert(categories)
      .values({
        nameFa: dto.nameFa,
        slug: dto.slug,
        description: dto.description,
        sortOrder: dto.sortOrder || 0,
      })
      .returning();

    return created;
  }
}
