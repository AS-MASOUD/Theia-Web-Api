import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { eq, and } from "drizzle-orm";
import { DRIZZLE_DB, DrizzleDb } from "../../database/database.provider";
import { faqItems } from "../../database/schema";

export interface CreateFaqDto {
  category: string;
  question: string;
  answer: string;
  sortOrder?: number;
  isPublished?: boolean;
}

@Injectable()
export class FaqService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async listPublished(category?: string) {
    const conditions = [eq(faqItems.isPublished, true)];
    if (category) {
      conditions.push(eq(faqItems.category, category));
    }

    const items = await this.db
      .select()
      .from(faqItems)
      .where(and(...conditions))
      .orderBy(faqItems.sortOrder);

    return items;
  }

  async listAdmin() {
    return this.db.select().from(faqItems).orderBy(faqItems.sortOrder);
  }

  async create(dto: CreateFaqDto) {
    const [created] = await this.db
      .insert(faqItems)
      .values({
        category: dto.category,
        question: dto.question,
        answer: dto.answer,
        sortOrder: dto.sortOrder || 0,
        isPublished: dto.isPublished ?? true,
      })
      .returning();

    return created;
  }

  async update(id: number, dto: Partial<CreateFaqDto>) {
    const [updated] = await this.db
      .update(faqItems)
      .set(dto)
      .where(eq(faqItems.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException("پرسش مورد نظر یافت نشد.");
    }
    return updated;
  }

  async delete(id: number) {
    const [deleted] = await this.db
      .delete(faqItems)
      .where(eq(faqItems.id, id))
      .returning({ id: faqItems.id });

    if (!deleted) {
      throw new NotFoundException("پرسش مورد نظر جهت حذف یافت نشد.");
    }
    return { success: true, deletedId: deleted.id };
  }
}
