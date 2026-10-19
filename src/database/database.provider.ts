import { Provider } from "@nestjs/common";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export const DRIZZLE_DB = "DRIZZLE_DB";
export type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

export const databaseProviders: Provider[] = [
  {
    provide: DRIZZLE_DB,
    useFactory: () => {
      const connectionString =
        process.env.DATABASE_URL ||
        "postgresql://theia_web_user:theia_web_password@localhost:5432/theia_website";

      const client = postgres(connectionString, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
      });

      return drizzle(client, { schema });
    },
  },
];
