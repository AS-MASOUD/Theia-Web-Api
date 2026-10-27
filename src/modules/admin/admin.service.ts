import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { eq, count, and } from "drizzle-orm";
import { DRIZZLE_DB, DrizzleDb } from "../../database/database.provider";
import { websiteAdmins, articles, comments, marketSignals } from "../../database/schema";
import { REDIS_CLIENT, CacheClient } from "../../common/redis/redis.provider";
import { AdminRole } from "../../common/decorators/roles.decorator";

export interface CreateStaffDto {
  email: string;
  password: string;
  fullName: string;
  role: AdminRole;
  bio?: string;
}

export interface UpdateStaffDto {
  fullName?: string;
  role?: AdminRole;
  bio?: string;
  isActive?: boolean;
  password?: string;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDb,
    @Inject(REDIS_CLIENT) private readonly cache: CacheClient,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, passwordPlain: string, clientIp: string) {
    // 1. Rate-limiting check for brute-force protection
    const rateLimitKey = `ratelimit:login:${clientIp}`;
    const attempts = await this.cache.get(rateLimitKey);
    const attemptCount = attempts ? parseInt(attempts, 10) : 0;

    if (attemptCount >= 5) {
      throw new BadRequestException(
        "تعداد تلاش‌های ناموفق بیش از حد مجاز است. لطفاً ۱۵ دقیقه دیگر تلاش کنید.",
      );
    }

    // 2. Query user
    const [admin] = await this.db
      .select()
      .from(websiteAdmins)
      .where(eq(websiteAdmins.email, email.toLowerCase().trim()))
      .limit(1);

    if (!admin || !admin.isActive) {
      await this.cache.set(rateLimitKey, String(attemptCount + 1), "EX", 900); // 15 mins
      throw new UnauthorizedException("ایمیل یا رمز عبور اشتباه است.");
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(passwordPlain, admin.passwordHash);
    if (!isMatch) {
      await this.cache.set(rateLimitKey, String(attemptCount + 1), "EX", 900);
      throw new UnauthorizedException("ایمیل یا رمز عبور اشتباه است.");
    }

    // Reset rate-limit on success
    await this.cache.del(rateLimitKey);

    // 4. Update lastLoginAt
    await this.db
      .update(websiteAdmins)
      .set({ lastLoginAt: new Date() })
      .where(eq(websiteAdmins.id, admin.id));

    // 5. Generate token
    const payload = {
      sub: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || "theia_default_website_secret_2026",
      expiresIn: parseInt(process.env.JWT_EXPIRATION_HOURS || "12", 10) * 3600,
    });

    return {
      token,
      user: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    };
  }

  async getProfile(adminId: number) {
    const [admin] = await this.db
      .select({
        id: websiteAdmins.id,
        email: websiteAdmins.email,
        fullName: websiteAdmins.fullName,
        avatarUrl: websiteAdmins.avatarUrl,
        bio: websiteAdmins.bio,
        role: websiteAdmins.role,
        isActive: websiteAdmins.isActive,
        createdAt: websiteAdmins.createdAt,
        lastLoginAt: websiteAdmins.lastLoginAt,
      })
      .from(websiteAdmins)
      .where(eq(websiteAdmins.id, adminId))
      .limit(1);

    if (!admin) {
      throw new UnauthorizedException("حساب کاربری یافت نشد.");
    }

    return admin;
  }

  async listStaffUsers() {
    return this.db
      .select({
        id: websiteAdmins.id,
        email: websiteAdmins.email,
        fullName: websiteAdmins.fullName,
        role: websiteAdmins.role,
        bio: websiteAdmins.bio,
        avatarUrl: websiteAdmins.avatarUrl,
        isActive: websiteAdmins.isActive,
        createdAt: websiteAdmins.createdAt,
        lastLoginAt: websiteAdmins.lastLoginAt,
      })
      .from(websiteAdmins)
      .orderBy(websiteAdmins.id);
  }

  async createStaffUser(dto: CreateStaffDto) {
    const existing = await this.db
      .select({ id: websiteAdmins.id })
      .from(websiteAdmins)
      .where(eq(websiteAdmins.email, dto.email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException("کاربری با این نشانی ایمیل قبلاً ثبت شده است.");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const [created] = await this.db
      .insert(websiteAdmins)
      .values({
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        fullName: dto.fullName || "کاربر سیستم",
        role: dto.role || "editor",
        bio: dto.bio || null,
        isActive: true,
      })
      .returning({
        id: websiteAdmins.id,
        email: websiteAdmins.email,
        fullName: websiteAdmins.fullName,
        role: websiteAdmins.role,
        bio: websiteAdmins.bio,
        isActive: websiteAdmins.isActive,
        createdAt: websiteAdmins.createdAt,
      });

    return created;
  }

  async updateStaffUser(id: number, dto: UpdateStaffDto, currentAdminId: number) {
    const [target] = await this.db
      .select()
      .from(websiteAdmins)
      .where(eq(websiteAdmins.id, id))
      .limit(1);

    if (!target) {
      throw new BadRequestException("کاربر مورد نظر یافت نشد.");
    }

    // Dynamic Role Protection: Prevent demoting or deactivating the last active Admin
    if (target.role === "admin" && (dto.role !== undefined && dto.role !== "admin" || dto.isActive === false)) {
      const activeAdmins = await this.db
        .select({ id: websiteAdmins.id })
        .from(websiteAdmins)
        .where(and(eq(websiteAdmins.role, "admin"), eq(websiteAdmins.isActive, true)));

      if (activeAdmins.length <= 1) {
        throw new ForbiddenException("حداقل یک مدیر ارشد فعال باید در سیستم باقی بماند.");
      }
    }

    const updatePayload: Record<string, any> = {};

    if (dto.fullName !== undefined) updatePayload.fullName = dto.fullName.trim();
    if (dto.role !== undefined) updatePayload.role = dto.role;
    if (dto.bio !== undefined) updatePayload.bio = dto.bio;
    if (dto.isActive !== undefined) updatePayload.isActive = dto.isActive;

    if (dto.password && dto.password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updatePayload.passwordHash = await bcrypt.hash(dto.password.trim(), salt);
    }

    const [updated] = await this.db
      .update(websiteAdmins)
      .set(updatePayload)
      .where(eq(websiteAdmins.id, id))
      .returning({
        id: websiteAdmins.id,
        email: websiteAdmins.email,
        fullName: websiteAdmins.fullName,
        role: websiteAdmins.role,
        bio: websiteAdmins.bio,
        isActive: websiteAdmins.isActive,
        createdAt: websiteAdmins.createdAt,
        lastLoginAt: websiteAdmins.lastLoginAt,
      });

    return updated;
  }

  async deleteStaffUser(id: number, currentAdminId: number) {
    if (id === currentAdminId) {
      throw new ForbiddenException("شما نمی‌توانید حساب کاربری جاری خود را حذف کنید.");
    }

    const [target] = await this.db
      .select()
      .from(websiteAdmins)
      .where(eq(websiteAdmins.id, id))
      .limit(1);

    if (!target) {
      throw new BadRequestException("کاربر مورد نظر یافت نشد.");
    }

    if (target.role === "admin") {
      const activeAdmins = await this.db
        .select({ id: websiteAdmins.id })
        .from(websiteAdmins)
        .where(and(eq(websiteAdmins.role, "admin"), eq(websiteAdmins.isActive, true)));

      if (activeAdmins.length <= 1) {
        throw new ForbiddenException("حذف آخرین مدیر ارشد فعال امکان‌پذیر نیست.");
      }
    }

    await this.db.delete(websiteAdmins).where(eq(websiteAdmins.id, id));
    return { success: true, message: "کاربر با موفقیت حذف گردید." };
  }

  async getDashboardStats() {
    const [articlesTotal] = await this.db.select({ value: count() }).from(articles);
    const [blogsTotal] = await this.db
      .select({ value: count() })
      .from(articles)
      .where(eq(articles.articleType, "blog"));
    const [newsTotal] = await this.db
      .select({ value: count() })
      .from(articles)
      .where(eq(articles.articleType, "news"));
    const [signalsTotal] = await this.db.select({ value: count() }).from(marketSignals);
    const [commentsTotal] = await this.db.select({ value: count() }).from(comments);
    const [staffTotal] = await this.db.select({ value: count() }).from(websiteAdmins);
    const [tradersTotal] = await this.db
      .select({ value: count() })
      .from(websiteAdmins)
      .where(eq(websiteAdmins.role, "trader"));

    return {
      totalArticles: Number(articlesTotal?.value || 0),
      totalBlogs: Number(blogsTotal?.value || 0),
      totalNews: Number(newsTotal?.value || 0),
      totalSignals: Number(signalsTotal?.value || 0),
      totalComments: Number(commentsTotal?.value || 0),
      totalStaff: Number(staffTotal?.value || 0),
      totalTraders: Number(tradersTotal?.value || 0),
    };
  }
}
