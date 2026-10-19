import * as dotenv from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

dotenv.config();

async function runMigrations() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://theia_web_user:theia_web_password@localhost:5432/theia_website";

  console.log("Connecting to theia_website database for migration...");
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log("Applying pending migrations from ./drizzle folder...");
  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log("Migrations applied successfully.");
  await sql.end();
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
