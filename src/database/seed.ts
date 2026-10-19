import * as dotenv from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import * as schema from "./schema";

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://theia_web_user:theia_web_password@localhost:5432/theia_website";

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

const SEED_CATEGORIES = [
  {
    nameFa: "اقتصاد کلان",
    slug: "macro-economics",
    description: "تحلیل سیاست‌های پولی، نرخ تورم و چشم‌انداز اقتصادی",
    sortOrder: 1,
  },
  {
    nameFa: "مدیریت ثروت",
    slug: "wealth-management",
    description: "استراتژی‌های چینش پورتفوی، حفظ ارزش دارایی و جریان نقد",
    sortOrder: 2,
  },
  {
    nameFa: "بازارها و طلا",
    slug: "markets",
    description: "بررسی روند بازارهای مالی، مسکن، طلا و ارز",
    sortOrder: 3,
  },
  {
    nameFa: "هوش مصنوعی و فین‌تک",
    slug: "fintech-ai",
    description: "کاربرد فناوری‌های نوین و مدل‌های هوشمند در تصمیم‌گیری مالی",
    sortOrder: 4,
  },
];

const SEED_ARTICLES = [
  {
    slug: "managing-assets-in-inflationary-economy",
    title: "استراتژی‌های بهینه‌سازی سبد دارایی در شرایط تورم ساختاری",
    summary:
      "چگونه می‌توان اثرات مخرب تورم فزاینده بر قدرت خرید سرمایه را از طریق توزیع هوشمند دارایی‌ها در ابزارهای ضدتورمی خنثی کرد.",
    content: `## مقدمه و اهمیت استراتژی ضد تورمی

در اقتصادی که تورم مزمن دو رقمی را تجربه می‌کند، نگهداری وجوه به شکل نقدینگی یا سپرده‌های بانکی با نرخ سود حقیقی منفی، سریع‌ترین راه برای فرسایش قدرت خرید است. پلتفرم **تیا** با تحلیل دقیق چرخه‌های اقتصادی به سرمایه‌گذاران کمک می‌کند تا از سرمایه خود در برابر این فرسایش محافظت کنند.

---

### اصول پایه‌ای توزیع بهینه دارایی

1. **تقسیم‌بندی ریسک**: پرهیز از تمرکز در یک بازار خاص.
2. **دارایی‌های با پیوند مستقیم به ارز**: طلا، صندوق‌های طلا و رمزدارایی‌ها.
3. **بازدهی نقدی و سرمایه‌گذاری مجدد**: استفاده از ابزارهای سودآور کوتاه‌مدت برای بهره‌برداری از افت‌های موقت بازار.

---

### ماتریس تخصیص پیشنهادی

در شرایط تورم بالای ۴۰ درصد، تخصیص دارایی‌ها باید به گونه‌ای باشد که حداقل ۷۰ درصد سبد در دارایی‌های مصون از تورم قرار گیرد. ابزارهای تحلیلی پلتفرم تیا به صورت خودکار انحراف سبد شما از این ترکیب بهینه را هشدار می‌دهند.`,
    readingTime: "۶ دقیقه",
    authorName: "دکتر مسعود رضایی",
    authorRole: "مدیر ارشد استراتژی سرمایه‌گذاری",
    categorySlug: "wealth-management",
  },
  {
    slug: "debt-amortization-and-inflation-arbitrage",
    title: "مفهوم استهلاک بدهی و آربیتراژ تورمی در ترازنامه شخصی",
    summary:
      "بررسی ریاضیاتی نحوه بازدهی اهرمی بدهی‌های ارزان‌قیمت در اقتصادهای تورمی و زمان‌بندی بازپرداخت تعهدات مالی.",
    content: `## آربیتراژ تورمی چیست؟

آربیتراژ تورمی (Inflation Arbitrage) زمانی رخ می‌دهد که نرخ بهره اسمی تسهیلات دریافتی کمتر از نرخ تورم انتظاری سالانه باشد. در چنین شرایطی، هزینه استقراض منفی خواهد بود.

---

### فرمول ریاضی بازده واقعی بدهی

نرخ واقعی استقراض از رابطه فیشر به دست می‌آید:
$$r \\approx i - \\pi$$

جایی که:
- $r$: نرخ بهره واقعی
- $i$: نرخ بهره اسمی تسهیلات
- $\\pi$: نرخ تورم سالانه

اگر نرخ تسهیلات ۲۳ درصد و تورم ۴۵ درصد باشد، نرخ بهره واقعی معادل منفی ۲۲ درصد است. یعنی ارزش واقعی بدهی هر سال ۲۲ درصد آب می‌رود.

---

### مدیریت ریسک در تیا

پلتفرم مالی تیا به صورت کاملاً خودکار تعهدات و اقساط شما را رصد کرده و نسبت به نقدینگی در دسترس تحلیل بازپرداخت زودهنگام یا حفظ بدهی را ارائه می‌دهد.`,
    readingTime: "۸ دقیقه",
    authorName: "مهندس سارا طاهری",
    authorRole: "تحلیل‌گر مالی و ریسک",
    categorySlug: "macro-economics",
  },
  {
    slug: "gold-and-currency-pricing-mechanisms",
    title: "مکانیسم حباب سکه و تحلیل حساسیت طلا در بازار ایران",
    summary:
      "تحلیل همبستگی قیمت طلای داخلی با انس جهانی و دلار، و فرمول دقیق محاسبه حباب قیمتی انواع سکه طلا.",
    content: `## ساختار قیمت‌گذاری طلای داخلی

قیمت یک گرم طلای ۱۸ عیار در بازار ایران تابعی از دو متغیر کلیدی است:
1. نرخ برابری دلار به ریال در بازار آزاد
2. نرخ اونس جهانی طلا (XAU/USD)

---

### فرمول ارزش ذاتی سکه تمام بهار آزادی

$$\\text{Intrinsic Value} = \\left( \\frac{\\text{Ounce} \\times \\text{USD Rate}}{31.1035} \\right) \\times 0.900 \\times 8.133 + \\text{Minting Cost}$$

حباب سکه حاصل تفاوت قیمت بازاری با این ارزش ذاتی است. در ماژول دیده‌بان بازار تیا، حباب هر یک از انواع سکه (امامی، بهار، نیم، ربع و گرمی) به صورت لحظه‌ای و شفاف محاسبه می‌شود.`,
    readingTime: "۵ دقیقه",
    authorName: "علیرضا پاک‌نهاد",
    authorRole: "کارشناس بازارهای طلا و کالا",
    categorySlug: "markets",
  },
  {
    slug: "ai-in-personal-financial-decision-making",
    title: "نقش هوش مصنوعی در پایش سلامت مالی فردی",
    summary:
      "چگونه مدل‌های هوشمند پردازش داده‌های مالی به ارزیابی دقیق‌تر ریسک، سناریوسازی آینده و رفتار سرمایه‌گذاری کمک می‌کنند.",
    content: `## از مدیریت سنتی تا تصمیم‌گیری داده‌محور

در گذشته، تحلیل وضعیت مالی شخصی محدود به اکسل‌های دستی و ثبت دوره‌ای هزینه‌ها بود. این روش‌ها فاقد قدرت پیش‌بینی، سناریوسازی و همگام‌سازی لحظه‌ای با تغییرات بازار بودند.

---

### تحول ایجادشده توسط پلتفرم تیا

پلتفرم مالی تیا از مدل‌های هوشمند برای تحلیل رفتارهای درآمدی و هزینه‌ای، بهینه‌سازی پورتفوی دارایی‌ها بر اساس نظریه مدرن پرتفوی (MPT)، و ارائه هشدارهای استراتژیک در هنگام تغییرات شدید بازار بهره می‌گیرد.`,
    readingTime: "۷ دقیقه",
    authorName: "تیم مهندسی هوش مصنوعی تیا",
    authorRole: "تحقیق و توسعه فین‌تک",
    categorySlug: "fintech-ai",
  },
];

const SEED_FAQS = [
  {
    category: "عمومی",
    question: "پلتفرم مالی تیا چیست و چه کمکی به من می‌کند؟",
    answer:
      "تیا یک مرکز فرماندهی و دستیار هوشمند مالی است که دارایی‌ها، بدهی‌ها، نقدینگی و اهداف مالی شما را یکپارچه کرده و راهکارهای بهینه‌سازی سبد دارایی و مقابله با تورم را ارائه می‌دهد.",
    sortOrder: 1,
  },
  {
    category: "امنیت",
    question: "امنیت اطلاعات و حریم خصوصی در تیا چگونه تضمین می‌شود؟",
    answer:
      "تمامی داده‌های هویتی و مالی کاربران با استانداردهای رمزنگاری سطح بالا (AES-256) محافظت شده و دسترسی‌ها طبق کنترل دسترسی چندسطحی کنترل می‌شوند.",
    sortOrder: 2,
  },
  {
    category: "اشتراک و قیمت‌گذاری",
    question: "آیا استفاده از تیا رایگان است؟",
    answer:
      "نسخه پایه تیا با قابلیت‌های مدیریت پورتفوی و پایش بازار به صورت رایگان ارائه می‌شود. نسخه‌های Pro امکانات پیشرفته هوش مصنوعی و گزارش‌های چندسناریویی را در اختیار شما می‌گذارند.",
    sortOrder: 3,
  },
  {
    category: "بازارها و داده‌ها",
    question: "نرخ‌های بازار چگونه به‌روزرسانی می‌شوند؟",
    answer:
      "داده‌های طلا، ارز، ارز دیجیتال و کالاها به طور مستقیم از منابع رسمی و موثق همگام‌سازی شده و تغییرات و حباب‌ها به صورت زنده محاسبه می‌شوند.",
    sortOrder: 4,
  },
];

async function seed() {
  console.log("--- Starting Theia Website Database Seeding ---");

  // 1. Seed Categories
  const categoryMap = new Map<string, number>();
  for (const cat of SEED_CATEGORIES) {
    const [existing] = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(eq(schema.categories.slug, cat.slug))
      .limit(1);

    if (existing) {
      categoryMap.set(cat.slug, existing.id);
      console.log(`[Category] Skipped existing: ${cat.slug}`);
    } else {
      const [inserted] = await db
        .insert(schema.categories)
        .values(cat)
        .returning({ id: schema.categories.id });
      categoryMap.set(cat.slug, inserted.id);
      console.log(`[Category] Created: ${cat.slug} (ID: ${inserted.id})`);
    }
  }

  // 2. Seed Articles
  for (const art of SEED_ARTICLES) {
    const categoryId = categoryMap.get(art.categorySlug);
    const [existing] = await db
      .select({ id: schema.articles.id })
      .from(schema.articles)
      .where(eq(schema.articles.slug, art.slug))
      .limit(1);

    if (existing) {
      console.log(`[Article] Skipped existing: ${art.slug}`);
    } else {
      const [inserted] = await db
        .insert(schema.articles)
        .values({
          slug: art.slug,
          title: art.title,
          summary: art.summary,
          content: art.content,
          readingTime: art.readingTime,
          authorName: art.authorName,
          authorRole: art.authorRole,
          categoryId,
          isPublished: true,
        })
        .returning({ id: schema.articles.id });
      console.log(`[Article] Created: ${art.slug} (ID: ${inserted.id})`);
    }
  }

  // 3. Seed FAQs
  for (const faq of SEED_FAQS) {
    const [existing] = await db
      .select({ id: schema.faqItems.id })
      .from(schema.faqItems)
      .where(eq(schema.faqItems.question, faq.question))
      .limit(1);

    if (existing) {
      console.log(`[FAQ] Skipped existing: "${faq.question.slice(0, 30)}..."`);
    } else {
      await db.insert(schema.faqItems).values(faq);
      console.log(`[FAQ] Created: "${faq.question.slice(0, 30)}..."`);
    }
  }

  // 4. Seed Default Release
  const [existingRelease] = await db
    .select({ id: schema.releases.id })
    .from(schema.releases)
    .where(eq(schema.releases.version, "v1.0.0"))
    .limit(1);

  if (!existingRelease) {
    await db.insert(schema.releases).values({
      version: "v1.0.0",
      releaseDate: "مهر ۱۴۰۴",
      summary: "انتشار عمومی وب‌سایت مستقل و مرکز فرماندهی مالی تیا",
      changesJson: JSON.stringify([
        "تفکیک کامل معماری وب‌سایت عمومی از داشبورد معاملات",
        "طراحی بازنویسی شده منطبق بر تایپوگرافی فارسی کلمه",
        "دیده‌بان لحظه‌ای نرخ‌های رسمی طلا، سکه، ارز و رمزارزها",
        "سامانه مقالات تحلیلی و آکادمی هوش مالی",
      ]),
      isPublished: true,
    });
    console.log("[Release] Created v1.0.0");
  }

  // 5. Seed Default Admin Account (if not exists)
  const defaultAdminEmail = "admin@theia-finance.ir";
  const [existingAdmin] = await db
    .select({ id: schema.websiteAdmins.id })
    .from(schema.websiteAdmins)
    .where(eq(schema.websiteAdmins.email, defaultAdminEmail))
    .limit(1);

  if (!existingAdmin) {
    const passwordPlain = process.env.INITIAL_ADMIN_PASSWORD || "Theia@Admin2026!";
    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    await db.insert(schema.websiteAdmins).values({
      email: defaultAdminEmail,
      passwordHash,
      role: "admin",
      isActive: true,
    });
    console.log(`[Admin] Initial administrator account created: ${defaultAdminEmail}`);
  }

  console.log("--- Seeding Completed Successfully ---");
  await client.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
