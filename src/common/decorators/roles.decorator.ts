import { SetMetadata } from "@nestjs/common";

export type AdminRole = "admin" | "editor" | "trader";
export const ROLES_KEY = "roles";
export const Roles = (...roles: AdminRole[]) => SetMetadata(ROLES_KEY, roles);
