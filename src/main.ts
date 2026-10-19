import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import { Logger } from "@nestjs/common";
import * as dotenv from "dotenv";
import { AppModule } from "./app.module";

dotenv.config();

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const port = parseInt(process.env.PORT || "4000", 10);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: process.env.NODE_ENV !== "production",
      trustProxy: true,
    }),
  );

  // Register Fastify plugins
  await app.register(fastifyCookie as any, {
    secret: process.env.COOKIE_SECRET || "theia_cookie_secret_fallback_key",
  });

  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
    : ["http://localhost:3000", "https://theia-finance.ir"];

  await app.register(fastifyCors as any, {
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  // Global API Prefix
  app.setGlobalPrefix("api/v1", {
    exclude: ["health"],
  });

  app.enableShutdownHooks();

  await app.listen(port, "0.0.0.0");
  logger.log(`Theia Website API is running on port ${port} (prefix: api/v1)`);
}

bootstrap().catch((err) => {
  console.error("Fatal error during bootstrap:", err);
  process.exit(1);
});
