import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { eq, desc, sql } from "drizzle-orm";
import { DRIZZLE_DB, DrizzleDb } from "../../database/database.provider";
import { contactMessages } from "../../database/schema";
import { REDIS_CLIENT, CacheClient } from "../../common/redis/redis.provider";

export interface SubmitContactDto {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDb,
    @Inject(REDIS_CLIENT) private readonly cache: CacheClient,
  ) {}

  async submitContact(dto: SubmitContactDto, clientIp: string) {
    // 1. Validation
    if (!dto.fullName || dto.fullName.trim().length < 2) {
      throw new BadRequestException("نام و نام خانوادگی باید حداقل ۲ کاراکتر باشد.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!dto.email || !emailRegex.test(dto.email)) {
      throw new BadRequestException("فرمت ایمیل نامعتبر است.");
    }
    if (!dto.subject || dto.subject.trim().length < 2) {
      throw new BadRequestException("موضوع پیام باید حداقل ۲ کاراکتر باشد.");
    }
    if (!dto.message || dto.message.trim().length < 5) {
      throw new BadRequestException("متن پیام باید حداقل ۵ کاراکتر باشد.");
    }

    // 2. Rate limit (max 5 contact submissions per 15 mins per IP)
    const rateLimitKey = `ratelimit:contact:${clientIp}`;
    const attempts = await this.cache.get(rateLimitKey);
    const count = attempts ? parseInt(attempts, 10) : 0;

    if (count >= 5) {
      throw new BadRequestException(
        "شما به سقف ارسال پیام در این بازه زمانی رسیده‌اید. لطفاً دقایقی دیگر تلاش کنید.",
      );
    }

    // 3. Persist
    const [inserted] = await this.db
      .insert(contactMessages)
      .values({
        fullName: dto.fullName.trim(),
        email: dto.email.trim().toLowerCase(),
        subject: dto.subject.trim(),
        message: dto.message.trim(),
        clientIp,
        status: "new",
      })
      .returning();

    // Increment rate-limit window (15 mins = 900s)
    await this.cache.set(rateLimitKey, String(count + 1), "EX", 900);

    return {
      success: true,
      message: "پیام شما با موفقیت ثبت شد و به زودی توسط کارشناسان تیا بررسی خواهد شد.",
      id: inserted.id,
    };
  }

  async listAdmin(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;

    const baseQuery = this.db.select().from(contactMessages);
    const countQuery = this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(contactMessages);

    if (status) {
      baseQuery.where(eq(contactMessages.status, status));
      countQuery.where(eq(contactMessages.status, status));
    }

    const items = await baseQuery
      .orderBy(desc(contactMessages.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await countQuery;

    return {
      items,
      total: countResult?.total || 0,
      page,
      limit,
    };
  }

  async updateStatus(id: number, status: string) {
    const [updated] = await this.db
      .update(contactMessages)
      .set({ status })
      .where(eq(contactMessages.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException("پیام مورد نظر یافت نشد.");
    }

    return updated;
  }
}
