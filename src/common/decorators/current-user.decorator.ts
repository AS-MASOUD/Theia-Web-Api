import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface AdminUserPayload {
  sub: number;
  email: string;
  role: "admin" | "editor";
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AdminUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
