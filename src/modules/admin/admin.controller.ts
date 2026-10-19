import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";
import { CurrentUser, AdminUserPayload } from "../../common/decorators/current-user.decorator";

interface LoginDto {
  email: string;
  password: string;
}

@Controller("admin/auth")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    if (!body?.email || !body?.password) {
      throw new BadRequestException("ایمیل و رمز عبور الزامی است.");
    }

    const clientIp =
      req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.ip || "127.0.0.1";

    const result = await this.adminService.login(body.email, body.password, String(clientIp));

    // Set secure HttpOnly cookie for session management
    const isProd = process.env.NODE_ENV === "production";
    res.setCookie("theia_admin_token", result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 3600, // 12 hours
    });

    return result;
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie("theia_admin_token", { path: "/" });
    return { success: true, message: "با موفقیت خارج شدید." };
  }

  @Get("me")
  @UseGuards(AdminAuthGuard)
  async getMe(@CurrentUser() user: AdminUserPayload) {
    return this.adminService.getProfile(user.sub);
  }
}
