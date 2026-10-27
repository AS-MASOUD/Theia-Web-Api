import * as dotenv from "dotenv";
import postgres = require("postgres");
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
    articleType: "blog",
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
    authorName: "مهندس سارا یزدانی",
    authorRole: "تحلیل‌گر کمی ریسک",
    categorySlug: "macro-economics",
    articleType: "blog",
  },
  {
    slug: "gold-and-currency-pricing-mechanisms",
    title: "مکانیسم‌های قیمت‌گذاری طلا و ارز در بازار داخل",
    summary:
      "تحلیل دقیق فرمول محاسبه حباب سکه، نرخ برابری درهم و اثر انتظارات تورمی بر قیمت بازاری طلا.",
    content: `## فرمول محاسبه حباب سکه طلا

قیمت ذاتی انواع سکه در ایران از رابطه زیر تعیین می‌شود:

$$\\text{ارزش ذاتی سکه} = \\frac{\\text{انس جهانی طلا} \\times \\text{نرخ دلار آزاد} \\times ۰.۹۰۰ \\times ۸.۱۳۳}{۳۱.۱۰۳۵} + \\text{حق ضرب}$$

اگر نرخ بازار فراتر از این رقم باشد، بازار با پدیده **حباب مثبت** مواجه است. سیستم هوشمند نرخ‌های تیا به صورت ۲۴ ساعته حباب تمامی مسکوکات را اندازه‌گیری و مخابره می‌کند.`,
    readingTime: "۵ دقیقه",
    authorName: "علیرضا کمالی",
    authorRole: "پژوهشگر ارشد بازار طلا و ارز",
    categorySlug: "markets",
    articleType: "news",
  },
  {
    slug: "ai-in-personal-financial-decision-making",
    title: "کاربرد هوش مصنوعی مولد در تصمیم‌گیری مالی شخصی",
    summary:
      "چگونه مدل‌های هوشمند یادگیری ماشین می‌توانند الگوهای مصرف پنهان، فرصت‌های بهینه‌سازی مالیاتی و ریسک‌های نقدینگی را شناسایی کنند.",
    content: `## گذار از صفحات گسترده سنتی به هوش محاسباتی

اکسل‌ها صرفاً داده‌های گذشته‌نگر را ثبت می‌کنند؛ در حالی که دستیار هوش مصنوعی تیا با تکیه بر مدل‌های پیش‌بینی سری زمانی، تصویر شفافی از مسیر دارایی و ریسک نقدینگی ماه آتی شما ارائه می‌دهد.`,
    readingTime: "۷ دقیقه",
    authorName: "دکتر نیما فرهادی",
    authorRole: "مدیر تیم هوش مصنوعی تیا",
    categorySlug: "fintech-ai",
    articleType: "news",
  },
];

const SEED_FAQS = [
  {
    category: "general",
    question: "پلتفرم مالی تیا چیست و چه کمکی به من می‌کند؟",
    answer:
      "تیا یک مرکز جامع و هوشمند مدیریت ثروت، رصد دارایی‌ها، محاسبه خودکار نسبت‌های تورمی و اتوماسیون تحلیل ریسک مالی است.",
    sortOrder: 1,
  },
  {
    category: "security",
    question: "امنیت اطلاعات و حریم خصوصی در تیا چگونه تضمین می‌شود؟",
    answer:
      "کلیه ارتباطات رمزنگاری شده و داده‌های حساس حساب‌ها با استاندارد AES-256 ذخیره می‌گردند. دسترسی به داده‌ها نیازمند تأیید دو مرحله‌ای است.",
    sortOrder: 2,
  },
  {
    category: "billing",
    question: "آیا استفاده از تیا رایگان است؟",
    answer:
      "سطح پایه تیا شامل دیده‌بان نرخ‌ها، ترازنامه اصلی و مقالات به صورت کاملاً رایگان در دسترس است. ابزارهای پیشرفته هوش مصنوعی نیازمند اشتراک حرفه‌ای هستند.",
    sortOrder: 3,
  },
  {
    category: "market",
    question: "نرخ‌های بازار چگونه به‌روزرسانی می‌شوند؟",
    answer:
      "نرخ‌های طلا، مسکوکات، ارزهای آزاد و رمزارزها از مراجع معتبر بازار به صورت زنده استخراج شده و پس از اعتبارسنجی الگوریتمی نمایش داده می‌شوند.",
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
  const seededArticleIds: number[] = [];
  for (const art of SEED_ARTICLES) {
    const categoryId = categoryMap.get(art.categorySlug);
    const [existing] = await db
      .select({ id: schema.articles.id })
      .from(schema.articles)
      .where(eq(schema.articles.slug, art.slug))
      .limit(1);

    if (existing) {
      seededArticleIds.push(existing.id);
      console.log(`[Article] Skipped existing: ${art.slug}`);
    } else {
      const [inserted] = await db
        .insert(schema.articles)
        .values({
          slug: art.slug,
          title: art.title,
          summary: art.summary,
          content: art.content,
          articleType: art.articleType as "blog" | "news",
          readingTime: art.readingTime,
          authorName: art.authorName,
          authorRole: art.authorRole,
          categoryId,
          isPublished: true,
        })
        .returning({ id: schema.articles.id });
      seededArticleIds.push(inserted.id);
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

  // 4. Seed Staff Accounts
  const defaultAdminEmail = "admin@theia-finance.ir";
  const [existingAdmin] = await db
    .select({ id: schema.websiteAdmins.id })
    .from(schema.websiteAdmins)
    .where(eq(schema.websiteAdmins.email, defaultAdminEmail))
    .limit(1);

  let adminId: number;
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("Theia@Admin2026!", 10);
    const [admin] = await db
      .insert(schema.websiteAdmins)
      .values({
        email: defaultAdminEmail,
        passwordHash,
        fullName: "مدیر ارشد سامانه تیا",
        role: "admin",
        bio: "مدیر سیستم، ناظر بر محتوا و تنظیمات سامانه",
        isActive: true,
      })
      .returning({ id: schema.websiteAdmins.id });
    adminId = admin.id;
    console.log(`[Admin] Administrator account created: ${defaultAdminEmail}`);
  } else {
    adminId = existingAdmin.id;
  }

  // Senior Trader
  const traderEmail = "trader@theia-finance.ir";
  let traderId: number;
  const [existingTrader] = await db
    .select({ id: schema.websiteAdmins.id })
    .from(schema.websiteAdmins)
    .where(eq(schema.websiteAdmins.email, traderEmail))
    .limit(1);

  if (!existingTrader) {
    const passwordHash = await bcrypt.hash("Theia@Trader2026!", 10);
    const [trader] = await db
      .insert(schema.websiteAdmins)
      .values({
        email: traderEmail,
        passwordHash,
        fullName: "مهندس سپهر آریامنش",
        role: "trader",
        bio: "معامله‌گر ارشد تکنیکال با بیش از ۱۰ سال سابقه در بازارهای طلا، فارکس و کریپتوکارنسی",
        isActive: true,
      })
      .returning({ id: schema.websiteAdmins.id });
    traderId = trader.id;
    console.log(`[Staff] Trader account created: ${traderEmail}`);
  } else {
    traderId = existingTrader.id;
  }

  // Editor
  const editorEmail = "editor@theia-finance.ir";
  const [existingEditor] = await db
    .select({ id: schema.websiteAdmins.id })
    .from(schema.websiteAdmins)
    .where(eq(schema.websiteAdmins.email, editorEmail))
    .limit(1);

  if (!existingEditor) {
    const passwordHash = await bcrypt.hash("Theia@Editor2026!", 10);
    await db.insert(schema.websiteAdmins).values({
      email: editorEmail,
      passwordHash,
      fullName: "نگار صبوری",
      role: "editor",
      bio: "سردبیر ارشد بخش مقالات اقتصادی و سواد مالی شخصی",
      isActive: true,
    });
    console.log(`[Staff] Editor account created: ${editorEmail}`);
  }

  // 5. Seed Chart Analyses (Blog-focused with charts, fundamentals, and indexes)
  const SEED_ANALYSES = [
    {
      title: "تحلیل جامع ساختار چارت انس جهانی طلا (XAU/USD) - واگرایی در تایم‌فریم روزانه و مؤلفه‌های کلان",
      symbol: "XAUUSD",
      marketCategory: "gold_coin" as const,
      trendBias: "BULLISH" as const,
      signalType: "BUY" as const,
      timeframe: "1D",
      summary: "بررسی رفتار قیمتی انس طلا در مواجهه با کاهش بازده اوراق قرضه آمریکا و تثبیت شاخص DXY در محدوده حمایتی ۱۰۳.۵.",
      chartImageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
      fundamentalData: JSON.stringify({
        dxyIndex: "103.4 (ضعیف و نزولی)",
        us10yYield: "4.12% (کاهش ۳ صدم درصدی)",
        fedPolicy: "احتمال ۷۲٪ کاهش نرخ بهره در نشست آتی",
        inflationRate: "2.4% سالانه (نزدیک به هدف ۲٪)",
        centralBanksBuying: "خرید مداوم ماهانه توسط بانک‌های مرکزی چین و هند",
      }),
      indexesSummary: JSON.stringify({
        fearGreedIndex: "68 (طمع / Greed)",
        vixVolatility: "14.2 (آرامش در بازارهای ریسکی)",
        rsiDaily: "63.8 (صعودی پایدار بدون اشباع)",
        tradingVolume: "حجم معاملات ۳۵٪ فراتر از میانگین ۲۰ روزه",
      }),
      keyLevels: JSON.stringify({
        majorSupport: "۲,۷۱۵ دلار",
        secondarySupport: "۲,۶۸۵ دلار",
        majorResistance: "۲,۷۸۵ دلار",
        targetZone: "۲,۸۲۰ الی ۲,۸۵۰ دلار",
      }),
      readingTime: "۵ دقیقه",
      analysisText: `## بررسی چندبعدی وضعیت انس جهانی طلا

در نمودار روزانه انس جهانی طلا (XAU/USD)، قیمت پس از تکمیل یک الگوی تثبیت فشردگی (Symmetrical Triangle)، موفق به خروج پرقدرت از سقف کنج شده است. میانگین متحرک نمایی ۵۰ دوره‌ای با شیب مثبت در حال حمایت از کف‌های بالاتر (Higher Lows) است.

### ارزیابی شاخص‌های بنیادین (Fundamental Drivers)
۱. **همبستگی معکوس با شاخص دلار (DXY)**: عقب‌نشینی شاخص دلار از سقف محلی ۱۰۴.۲ به سمت ۱۰۳.۴ موجب آزادسازی پتانسیل رشد دارایی‌های امن بر پایه دلار شده است.
۲. **بازده واقعی اوراق قرضه**: با کاهش انتظارات تورمی و افت بازده اوراق ۱۰ ساله به ۴.۱۲٪، هزینه فرصت نگهداری طلا به کمترین میزان در ۳ ماه گذشته رسیده است.
۳. **جریان ورود نقدینگی به ETFها**: گزارش هفتگی شورای جهانی طلا نشان‌دهنده دومین هفته متوالی ورودی خالص مثبت به صندوق‌های تحت پشتوانه طلای فیزیکی است.

### دیدگاه ساختاری چارت
تا زمانی که کندل هفتگی بالای محدوده ۲,۷۰۰ دلار بسته شود، تمایل تکنیکال بازار کاملاً صعودی (Bullish) ارزیابی می‌شود. معامله‌گران می‌توانند در پولبک‌ها به مناطق تقاضا، رفتار قیمت را برای همراهی با روند اصلی رصد نمایند.`,
      traderId,
      traderName: "سپهر آریامنش",
      traderRole: "تحلیل‌گر ارشد طلا و بازارهای بین‌الملل",
      isPublished: true,
    },
    {
      title: "تحلیل تکنیکال و فاندامنتال سکه تمام امامی - ارزیابی حباب قیمتی و تقاضای صندوق‌های طلا",
      symbol: "EMAMI_COIN",
      marketCategory: "gold_coin" as const,
      trendBias: "BULLISH" as const,
      signalType: "BUY" as const,
      timeframe: "1D",
      summary: "تحلیل همزمان نرخ حواله درهم، دلار نیما و اثر جهش انس جهانی بر قیمت تعادلی سکه بهار آزادی و صندوق‌های بورس کالا.",
      chartImageUrl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80",
      fundamentalData: JSON.stringify({
        nimaRate: "۵۱,۲۰۰ تومان (گارد صعودی ملایم)",
        dirhamArbitrage: "نرخ برابری معادل دلار ۶۹,۲۰۰ تومانی",
        goldCoinBubble: "۲۳٪ (محدوده متعادل تاریخی)",
        bourseGoldFundsFlow: "ورود روزانه ۱۸۰ میلیارد تومان پول حقیقی",
      }),
      indexesSummary: JSON.stringify({
        bubbleRatio: "حباب ۲۲.۸٪ (متعادل)",
        marketBreadth: "همگرایی مثبت میان تمام قطعات سکه",
        rsiWeekly: "66.4 (قدرت خریداران)",
      }),
      keyLevels: JSON.stringify({
        majorSupport: "۵۲,۵۰۰,۰۰۰ تومان",
        resistanceZone: "۵۶,۰۰۰,۰۰۰ تومان",
        targetChannel: "۵۸,۰۰۰,۰۰۰ الی ۶۰,۰۰۰,۰۰۰ تومان",
      }),
      readingTime: "۴ دقیقه",
      analysisText: `## بررسی روندهای داخلی سکه و طلا

چارت سکه طرح جدید (امامی) در تایم‌فریم روزانه درون یک کانال صعودی معتبر قرار دارد و پس از اصلاح موقت به میانگین متحرک ۲۱ روزه، کندل پرقدرت صعودی به ثبت رسانده است.

### تحلیل متغیرهای پیش‌ران
- **پایداری نرخ ارز در بازار آزاد**: عدم کاهش معنادار نرخ حواله درهم نشان می‌دهد که کف قیمتی مسکوکات در سطوح فعلی مستحکم است.
- **رفتار هوشمند صندوق‌های طلای بورس**: سرانه خرید خریداران حقیقی در صندوق‌های طلا بیش از ۳ برابر فروشندگان بوده که بیانگر تشکیل پورتفولیو توسط سرمایه‌گذاران حقوقی و بزرگ است.

### جمع‌بندی تحلیل
ساختار کلی چارت به نفع خریداران است؛ با این حال خریدهای هیجانی در روزهایی که حباب سکه فراتر از ۲۸ درصد می‌رود توصیه نمی‌شود و ورود در نواحی حمایت داینامیک ریسک کمتری به همراه دارد.`,
      traderId,
      traderName: "سپهر آریامنش",
      traderRole: "معامله‌گر ارشد طلا و مشتقه",
      isPublished: true,
    },
    {
      title: "تحلیل نمودار بیت‌کوین (BTC/USDT) - دامیننس، چرخه نقدینگی و شاخص‌های آنچین",
      symbol: "BTC",
      marketCategory: "crypto" as const,
      trendBias: "BULLISH" as const,
      signalType: "BUY" as const,
      timeframe: "1D",
      summary: "شکست مقاومت کلیدی ۶۸ هزار دلار همراه با کاهش موجودی بیت‌کوین در صرافی‌های متمرکز و افزایش موقعیت‌های خرید نهادی.",
      chartImageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      fundamentalData: JSON.stringify({
        etfNetInflows: "+۴۵۰ میلیون دلار ورودی خالص روزانه ETF اسپات",
        exchangeReserves: "کمترین موجودی بیت‌کوین در صرافی‌ها از سال ۲۰۲۱",
        hashrate: "سقف تاریخی ۷۱۰ اگزاهش بر ثانیه",
        stablecoinSupply: "افزایش ۴ میلیارد دلاری نقدینگی تتر در ماه اخیر",
      }),
      indexesSummary: JSON.stringify({
        fearGreedIndex: "74 (طمع شدید / Extreme Greed)",
        btcDominance: "58.4% (تمرکز سرمایه در لیدر بازار)",
        mvrvZScore: "2.1 (محدوده ارزش‌گذاری منصفانه، بسیار دور از قله حباب)",
        nvtRatio: "متعادل و نشان‌دهنده ارزش شبکه قوی",
      }),
      keyLevels: JSON.stringify({
        majorSupport: "۶۵,۲۰۰ دلار",
        keyBreakoutLevel: "۶۸,۸۰۰ دلار",
        allTimeHighResistance: "۷۳,۸۰۰ دلار",
      }),
      readingTime: "۶ دقیقه",
      analysisText: `## واکاوی حرکت اخیر بیت‌کوین

نمودار قیمت بیت‌کوین در بازه هفتگی یک الگوی فنجان و دسته (Cup and Handle) در اشل کلان را تکمیل نموده است. تثبیت بالای میانگین متحرک ۲۰۰ روزه و بازپس‌گیری محدوده مقاومتی ۶۷,۰۰۰ دلار، چرخه بازار را از فاز انباشت (Accumulation) به فاز صعود پرشتاب (Markup) هدایت کرده است.

### شاخص‌های آنچین و فاندامنتال
۱. **نرخ خروج از صرافی‌ها (Outflow)**: داده‌های گلس‌نود نشان می‌دهد نهنگ‌های با موجودی بالای ۱,۰۰۰ کوین به طور مداوم در حال انتقال موجودی به کیف‌پول‌های سرد هستند.
۲. **تقاضای نهادی بدون توقف**: ورودی پایدار به صندوق‌های IBIT بلک‌راک و FBTC فیدلیتی نقش اهرم ثبات‌بخش را ایفا می‌کند.
۳. **دامیننس بیت‌کوین**: رسیدن دامیننس به بالای ۵۸٪ نشان می‌دهد سرمایه‌گذاران در گام اول روند صعودی تمایلی به ورود به آلت‌کوین‌ها ندارند و تمرکز روی پادشاه رمزارزهاست.`,
      traderId,
      traderName: "سپهر آریامنش",
      traderRole: "تحلیل‌گر بازارهای دیجیتال و بین‌الملل",
      isPublished: true,
    },
    {
      title: "دیده‌بان اسکناس دلار آمریکا (USD) - بررسی کنج متقارن، تزریق درهم و شاخص تورم انتظاری",
      symbol: "USD",
      marketCategory: "currency" as const,
      trendBias: "NEUTRAL" as const,
      signalType: "HOLD" as const,
      timeframe: "1D",
      summary: "بررسی وضعیت رنج دلار در محدوده کانال ۶۸ الی ۷۰ هزار تومان و ارزیابی تأثیر سیاست‌های انبساطی نقدینگی.",
      chartImageUrl: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1200&q=80",
      fundamentalData: JSON.stringify({
        marketIntervention: "تزریق پیوسته بازارساز در نرخ‌های بالای ۶۹ هزار تومان",
        oilExportsIncome: "رشد درآمدهای ارزی وصولی نفتی",
        broadMoneyGrowth: "رشد سالانه نقدینگی حدود ۲۸ درصد",
        cpiInflation: "نرخ تورم نقطه به نقطه ۳۲ درصد",
      }),
      indexesSummary: JSON.stringify({
        volatilityBand: "نوسان تاریخی زیر ۱.۵٪ روزانه",
        fxSpread: "اختلاف ۱۲۰۰ تومانی حواله و اسکناس",
        sentimentScore: "50 (بی‌طرف و رنج)",
      }),
      keyLevels: JSON.stringify({
        supportFloor: "۶۷,۵۰۰ تومان",
        upperRangeLimit: "۷۰,۵۰۰ تومان",
      }),
      readingTime: "۴ دقیقه",
      analysisText: `## رصد نمودار و بنیاد بازار ارز آزاد

چارت روزانه دلار آزاد نشان‌دهنده تثبیت قیمت در قالب یک کنج متقارن فشرده است. سقف‌های کوتاه‌مدت متوالی پایین‌تر و کف‌های بالاتر، خبر از آماده شدن بازار برای یک حرکت جهت‌دار در هفته‌های آتی می‌دهد.

### بررسی عوامل اثرگذار
- **سیاست‌های بازارساز**: عرضه مداوم اسکناس در مرکز مبادله و کنترل نوسان حواله درهم مانع از شکل‌گیری روندهای انفجاری کوتاه‌مدت شده است.
- **تراز تجاری غیرنفتی**: کسری تراز تجاری کماکان یکی از محرک‌های ساختاری نرخ ارز در میان‌مدت باقی مانده است.

### استراتژی پیشنهادی تحلیل‌گر
در شرایط فاز رنج (Consolidation)، بهترین رفتار مالی حفظ ارزش پایه دارایی در سبد ضدتورمی و پرهیز از معاملات اهرمی در حاشیه سقف‌های قیمتی است.`,
      traderId,
      traderName: "سپهر آریامنش",
      traderRole: "معامله‌گر ارشد ارز و مشتقه",
      isPublished: true,
    },
  ];

  for (const item of SEED_ANALYSES) {
    const [existing] = await db
      .select({ id: schema.marketSignals.id })
      .from(schema.marketSignals)
      .where(eq(schema.marketSignals.title, item.title))
      .limit(1);

    if (!existing) {
      await db.insert(schema.marketSignals).values(item);
      console.log(`[Analysis] Created: "${item.title.slice(0, 35)}..."`);
    } else {
      // Update with new rich data fields
      await db
        .update(schema.marketSignals)
        .set(item)
        .where(eq(schema.marketSignals.id, existing.id));
      console.log(`[Analysis] Updated existing with rich data: "${item.title.slice(0, 35)}..."`);
    }
  }

  // 6. Seed Comments on articles
  if (seededArticleIds.length > 0) {
    const firstArticleId = seededArticleIds[0];
    const [existingComment] = await db
      .select({ id: schema.comments.id })
      .from(schema.comments)
      .where(eq(schema.comments.articleId, firstArticleId))
      .limit(1);

    if (!existingComment) {
      await db.insert(schema.comments).values([
        {
          articleId: firstArticleId,
          userName: "امیرحسین رضوی",
          userEmail: "amir@example.com",
          content: "تحلیل بسیار عالی و کاربردی بود. بخصوص فرمول محاسبه بازدهی حقیقی بدهی در اقتصاد تورمی دید بسیار خوبی به من داد.",
          isApproved: true,
        },
        {
          articleId: firstArticleId,
          userName: "مریم دادخواه",
          userEmail: "maryam.d@example.com",
          content: "ممنون از تیم تیا. نسبت به صندوق‌های طلای بورس کالا هم اگر مقاله‌ای تهیه کنید بسیار عالی خواهد شد.",
          isApproved: true,
        },
      ]);
      console.log("[Comment] Seeded initial user comments");
    }
  }

  console.log("--- Seeding Completed Successfully ---");
  await client.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
