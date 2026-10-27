import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ParseIntPipe,
} from "@nestjs/common";
import { AdminService, CreateStaffDto, UpdateStaffDto } from "./admin.service";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, AdminUserPayload } from "../../common/decorators/current-user.decorator";

interface LoginDto {
  email: string;
  password: string;
}

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("auth/login")
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

  @Post("auth/logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie("theia_admin_token", { path: "/" });
    return { success: true, message: "با موفقیت خارج شدید." };
  }

  @Get("auth/me")
  @UseGuards(AdminAuthGuard)
  async getMe(@CurrentUser() user: AdminUserPayload) {
    return this.adminService.getProfile(user.sub);
  }

  @Get("stats")
  @UseGuards(AdminAuthGuard)
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  // --- Role & Staff Management (Admin Only) ---
  @Get("users")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin")
  async listStaff() {
    return this.adminService.listStaffUsers();
  }

  @Post("users")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin")
  async createStaff(@Body() dto: CreateStaffDto) {
    if (!dto.email || !dto.password || !dto.fullName) {
      throw new BadRequestException("نام، ایمیل و کلمه عبور الزامی است.");
    }
    return this.adminService.createStaffUser(dto);
  }

  @Put("users/:id")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin")
  async updateStaff(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateStaffDto,
    @CurrentUser() user: AdminUserPayload,
  ) {
    return this.adminService.updateStaffUser(id, dto, user.sub);
  }

  @Delete("users/:id")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin")
  async deleteStaff(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: AdminUserPayload,
  ) {
    return this.adminService.deleteStaffUser(id, user.sub);
  }
}
