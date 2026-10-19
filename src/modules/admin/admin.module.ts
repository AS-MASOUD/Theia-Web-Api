import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "theia_default_website_secret_2026",
      signOptions: { expiresIn: "12h" },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminAuthGuard, RolesGuard],
  exports: [AdminService, AdminAuthGuard, RolesGuard, JwtModule],
})
export class AdminModule {}
