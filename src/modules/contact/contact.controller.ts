import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { ContactService, SubmitContactDto } from "./contact.service";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";

@Controller()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post("public/contact")
  async submitContact(@Body() body: SubmitContactDto, @Req() req: any) {
    const clientIp =
      req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.ip || "127.0.0.1";

    return this.contactService.submitContact(body, String(clientIp));
  }

  @Get("admin/contact-messages")
  @UseGuards(AdminAuthGuard)
  async listAdmin(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: string,
  ) {
    return this.contactService.listAdmin(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      status,
    );
  }

  @Patch("admin/contact-messages/:id/status")
  @UseGuards(AdminAuthGuard)
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body("status") status: string,
  ) {
    return this.contactService.updateStatus(id, status);
  }
}
