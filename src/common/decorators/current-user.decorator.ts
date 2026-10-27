import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AdminRole } from "./roles.decorator";

export interface AdminUserPayload {
  sub: number;
  email: string;
  fullName?: string;
  role: AdminRole;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AdminUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
