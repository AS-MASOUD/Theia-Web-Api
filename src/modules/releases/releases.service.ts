import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { eq, desc } from "drizzle-orm";
import { DRIZZLE_DB, DrizzleDb } from "../../database/database.provider";
import { releases } from "../../database/schema";

export interface CreateReleaseDto {
  version: string;
  releaseDate: string;
  summary: string;
  changesJson: string; // JSON array of string
  isPublished?: boolean;
}

@Injectable()
export class ReleasesService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async listPublished() {
    const items = await this.db
      .select()
      .from(releases)
      .where(eq(releases.isPublished, true))
      .orderBy(desc(releases.createdAt));

    return items.map((r) => {
      let changes: string[] = [];
      try {
        changes = JSON.parse(r.changesJson);
      } catch {
        changes = [r.changesJson];
      }
      return {
        ...r,
        changes,
      };
    });
  }

  async listAdmin() {
    return this.db.select().from(releases).orderBy(desc(releases.createdAt));
  }

  async create(dto: CreateReleaseDto) {
    const [created] = await this.db
      .insert(releases)
      .values({
        version: dto.version,
        releaseDate: dto.releaseDate,
        summary: dto.summary,
        changesJson: dto.changesJson,
        isPublished: dto.isPublished ?? true,
      })
      .returning();

    return created;
  }

  async update(id: number, dto: Partial<CreateReleaseDto>) {
    const [updated] = await this.db
      .update(releases)
      .set(dto)
      .where(eq(releases.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException("نسخه انتشار مورد نظر یافت نشد.");
    }
    return updated;
  }

  async delete(id: number) {
    const [deleted] = await this.db
      .delete(releases)
      .where(eq(releases.id, id))
      .returning({ id: releases.id });

    if (!deleted) {
      throw new NotFoundException("نسخه انتشار مورد نظر جهت حذف یافت نشد.");
    }
    return { success: true, deletedId: deleted.id };
  }
}
