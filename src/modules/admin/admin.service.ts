import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { DRIZZLE_DB, DrizzleDb } from "../../database/database.provider";
import { websiteAdmins } from "../../database/schema";
import { REDIS_CLIENT, CacheClient } from "../../common/redis/redis.provider";

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
    const count = attempts ? parseInt(attempts, 10) : 0;

    if (count >= 5) {
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
      await this.cache.set(rateLimitKey, String(count + 1), "EX", 900); // 15 mins
      throw new UnauthorizedException("ایمیل یا رمز عبور اشتباه است.");
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(passwordPlain, admin.passwordHash);
    if (!isMatch) {
      await this.cache.set(rateLimitKey, String(count + 1), "EX", 900);
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
        role: admin.role,
      },
    };
  }

  async getProfile(adminId: number) {
    const [admin] = await this.db
      .select({
        id: websiteAdmins.id,
        email: websiteAdmins.email,
        role: websiteAdmins.role,
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

  async createAdminUser(email: string, passwordPlain: string, role: "admin" | "editor" = "editor") {
    const existing = await this.db
      .select({ id: websiteAdmins.id })
      .from(websiteAdmins)
      .where(eq(websiteAdmins.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException("کاربری با این ایمیل قبلاً ثبت شده است.");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);

    const [created] = await this.db
      .insert(websiteAdmins)
      .values({
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
        isActive: true,
      })
      .returning({
        id: websiteAdmins.id,
        email: websiteAdmins.email,
        role: websiteAdmins.role,
        createdAt: websiteAdmins.createdAt,
      });

    return created;
  }
}
