# Theia Finance — Dedicated Website API (`theia-web-api`)

This repository provides the independent content management, editorial operations, contact form handling, and public market feed proxy for **Theia Finance**'s public website (`theia-web`).

## Architecture & Boundaries

- **Framework**: NestJS 11 + Fastify adapter (`@nestjs/platform-fastify`)
- **Database**: PostgreSQL logical database `theia_website` (isolated from the financial database `personal_fc`)
- **ORM**: Drizzle ORM + Drizzle Kit
- **Cache & Rate Limiting**: Redis
- **Authentication**: Dedicated website editorial JWT with password hashing (bcryptjs) and HttpOnly cookies. No customer financial account data or authentication logic is handled here.
- **Market Data Feed**: Safe caching reverse proxy to authoritative FastAPI backend (`theia-finance-api:8081/api/v1/assets/market/rates`), providing resilient stale quote retention and unavailable flags without fake fallback pricing.

## Getting Started

### 1. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Database Migrations & Seeding

```bash
# Generate schema migrations
pnpm run db:generate

# Apply migrations to theia_website database
pnpm run db:migrate

# Seed initial categories, articles, and default admin account
pnpm run db:seed
```

### 4. Running the Application

```bash
# Development mode
pnpm run start:dev

# Production build and run
pnpm run build
pnpm run start:prod
```

### 5. Running Tests

```bash
pnpm test
```
