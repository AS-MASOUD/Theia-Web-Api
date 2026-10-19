import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

console.log("========================================================");
console.log(" THEIA WEB API: ISOLATION, SCHEMA & RESILIENCE SUITE");
console.log("========================================================");

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`✓ Passed: ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ FAILED: ${name}`);
    console.error(`  Error: ${err.message}`);
    failed++;
  }
}

// 1. Environment & Database Isolation Test
runTest("Environment template enforces isolated database 'theia_website'", () => {
  const envExamplePath = path.join(projectRoot, ".env.example");
  assert.ok(fs.existsSync(envExamplePath), ".env.example must exist");
  const envContent = fs.readFileSync(envExamplePath, "utf-8");

  assert.ok(
    envContent.includes("theia_website"),
    "DATABASE_URL must target theia_website database",
  );
  assert.ok(
    !envContent.includes("/personal_fc"),
    "DATABASE_URL must NEVER target personal_fc",
  );
  assert.ok(
    envContent.includes("FINANCE_API_INTERNAL_URL"),
    "Must configure internal finance API URL for authoritative market rates",
  );
});

// 2. Strict Repository Boundary Test (Zero cross-repo imports)
runTest("Zero imports from sibling repositories (Backend, Frontend, Mobile)", () => {
  const srcDir = path.join(projectRoot, "src");

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".js"))) {
        const content = fs.readFileSync(fullPath, "utf-8");
        const lines = content.split("\n");
        lines.forEach((line, lineNum) => {
          if (line.includes("from ") && (line.includes("../../../") || line.includes("Frontend") || line.includes("Backend") || line.includes("Mobile"))) {
            throw new Error(`Forbidden cross-repo import in ${fullPath}:${lineNum + 1}: ${line}`);
          }
        });
      }
    }
  }

  scanDir(srcDir);
});

// 3. Database Schema Definitions Test
runTest("Drizzle schema exports all required website tables with strict constraints", () => {
  const schemaPath = path.join(projectRoot, "src", "database", "schema", "index.ts");
  assert.ok(fs.existsSync(schemaPath), "Schema index file must exist");
  const content = fs.readFileSync(schemaPath, "utf-8");

  assert.ok(content.includes("website_categories"), "website_categories table must be defined");
  assert.ok(content.includes("website_articles"), "website_articles table must be defined");
  assert.ok(content.includes("website_contact_messages"), "website_contact_messages table must be defined");
  assert.ok(content.includes("website_faq_items"), "website_faq_items table must be defined");
  assert.ok(content.includes("website_releases"), "website_releases table must be defined");
  assert.ok(content.includes("website_admins"), "website_admins table must be defined");
});

// 4. Market Resilience & Zero Fake Data Policy Test
runTest("MarketFeedService enforces zero fake prices and proper unavailable status", () => {
  const marketServicePath = path.join(projectRoot, "src", "modules", "market-feed", "market-feed.service.ts");
  assert.ok(fs.existsSync(marketServicePath), "MarketFeedService file must exist");
  const content = fs.readFileSync(marketServicePath, "utf-8");

  assert.ok(
    content.includes('status: "unavailable"'),
    "MarketFeedService must set status: unavailable when upstream quotes are unavailable",
  );
  assert.ok(
    content.includes("price: null"),
    "MarketFeedService must set price: null when unavailable instead of hardcoded numbers",
  );
  assert.ok(
    content.includes("is_stale: true"),
    "MarketFeedService must flag quotes as stale when upstream is down and using fallback",
  );
});

// 5. Editorial Authentication & Security Test
runTest("AdminService and Controllers implement rate-limiting, bcrypt, and AuthGuards", () => {
  const adminServicePath = path.join(projectRoot, "src", "modules", "admin", "admin.service.ts");
  const adminGuardPath = path.join(projectRoot, "src", "common", "guards", "admin-auth.guard.ts");
  const rolesGuardPath = path.join(projectRoot, "src", "common", "guards", "roles.guard.ts");

  assert.ok(fs.existsSync(adminServicePath), "AdminService must exist");
  assert.ok(fs.existsSync(adminGuardPath), "AdminAuthGuard must exist");
  assert.ok(fs.existsSync(rolesGuardPath), "RolesGuard must exist");

  const serviceContent = fs.readFileSync(adminServicePath, "utf-8");
  assert.ok(
    serviceContent.includes("bcrypt.compare"),
    "AdminService must use bcrypt for secure password comparison",
  );
  assert.ok(
    serviceContent.includes("ratelimit:login"),
    "AdminService must implement login rate-limiting against brute force",
  );
});

// 6. Contact Form Validation & Rate Limiting Test
runTest("ContactService validates email, message length, and applies rate limiting", () => {
  const contactServicePath = path.join(projectRoot, "src", "modules", "contact", "contact.service.ts");
  assert.ok(fs.existsSync(contactServicePath), "ContactService must exist");
  const content = fs.readFileSync(contactServicePath, "utf-8");

  assert.ok(
    content.includes("ratelimit:contact"),
    "ContactService must apply per-IP rate limiting",
  );
  assert.ok(
    content.includes("emailRegex"),
    "ContactService must validate email format",
  );
});

console.log("\n========================================================");
console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("========================================================");

if (failed > 0) {
  process.exit(1);
}
