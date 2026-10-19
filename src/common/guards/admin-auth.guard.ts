import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AdminUserPayload } from "../decorators/current-user.decorator";

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException("احراز هویت انجام نشده است یا نشست منقضی شده است.");
    }

    try {
      const secret = process.env.JWT_SECRET || "theia_default_website_secret_2026";
      const payload = await this.jwtService.verifyAsync<AdminUserPayload>(token, {
        secret,
      });

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException("نشست کاربری نامعتبر است. لطفا مجددا وارد شوید.");
    }
  }

  private extractToken(request: any): string | null {
    // 1. Try Authorization header
    const authHeader = request.headers?.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    // 2. Try Fastify cookies
    if (request.cookies && request.cookies.theia_admin_token) {
      return request.cookies.theia_admin_token;
    }

    return null;
  }
}
