import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import {
  MarketSignalsService,
  CreateSignalDto,
  UpdateSignalDto,
} from "./market-signals.service";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, AdminUserPayload } from "../../common/decorators/current-user.decorator";

@Controller()
export class MarketSignalsController {
  constructor(private readonly signalsService: MarketSignalsService) {}

  // --- Public Endpoints ---
  @Get("public/signals")
  async listPublicSignals(
    @Query("category") category?: string,
    @Query("symbol") symbol?: string,
    @Query("limit") limit?: string,
  ) {
    return this.signalsService.listPublic({
      marketCategory: category,
      symbol,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get("public/signals/:id")
  async getPublicSignalById(@Param("id", ParseIntPipe) id: number) {
    return this.signalsService.getPublicById(id);
  }

  // --- Admin & Trader Management Endpoints ---
  @Get("admin/signals")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin", "trader")
  async listAdminSignals(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.signalsService.listAllAdmin(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get("admin/signals/:id")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin", "trader")
  async getSignalById(@Param("id", ParseIntPipe) id: number) {
    return this.signalsService.getByIdAdmin(id);
  }

  @Post("admin/signals")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin", "trader")
  async createSignal(
    @Body() dto: CreateSignalDto,
    @CurrentUser() user: AdminUserPayload,
  ) {
    return this.signalsService.createSignal(dto, user);
  }

  @Put("admin/signals/:id")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin", "trader")
  async updateSignal(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateSignalDto,
    @CurrentUser() user: AdminUserPayload,
  ) {
    return this.signalsService.updateSignal(id, dto, user);
  }

  @Delete("admin/signals/:id")
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles("admin", "trader")
  async deleteSignal(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: AdminUserPayload,
  ) {
    return this.signalsService.deleteSignal(id, user);
  }
}
