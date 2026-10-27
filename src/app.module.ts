import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { RedisModule } from "./common/redis/redis.module";
import { AdminModule } from "./modules/admin/admin.module";
import { ArticlesModule } from "./modules/articles/articles.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { ContactModule } from "./modules/contact/contact.module";
import { FaqModule } from "./modules/faq/faq.module";
import { ReleasesModule } from "./modules/releases/releases.module";
import { MarketFeedModule } from "./modules/market-feed/market-feed.module";
import { HealthModule } from "./modules/health/health.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { MarketSignalsModule } from "./modules/market-signals/market-signals.module";

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    AdminModule,
    ArticlesModule,
    CategoriesModule,
    ContactModule,
    FaqModule,
    ReleasesModule,
    MarketFeedModule,
    HealthModule,
    CommentsModule,
    MarketSignalsModule,
  ],
})
export class AppModule {}
