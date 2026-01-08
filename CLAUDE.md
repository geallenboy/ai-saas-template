# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI SaaS Template - A production-ready, enterprise-grade full-stack TypeScript template for building AI-powered SaaS applications. Built with Next.js 15 App Router, React 19, tRPC, Drizzle ORM, and Better Auth.

**Key Stats**: ~43k lines of code, 49+ pages/layouts, fully internationalized (zh/en)

## Essential Commands

### Development
```bash
pnpm dev                    # Start dev server (Turbo mode)
pnpm build                  # Production build
pnpm start                  # Start production server
```

### Code Quality
```bash
pnpm lint                   # Biome check + auto-fix
pnpm type-check             # TypeScript validation
pnpm ci                     # Full CI check (type + lint + test)
pnpm quality:check          # Complete quality audit (type + lint + format + coverage)
```

### Testing
```bash
pnpm test                   # Run all tests
pnpm test:dev               # Watch mode
pnpm test:coverage          # Generate coverage report
pnpm test:e2e               # Run E2E tests (Playwright)
```

### Database
```bash
pnpm db:generate            # Generate migration files
pnpm db:migrate             # Run migrations
pnpm db:studio              # Open Drizzle Studio GUI
pnpm db:push                # Push schema to database (dev only)
```

### Single Test Execution
```bash
pnpm test -- path/to/test.test.ts           # Run specific test file
pnpm test -- -t "test name pattern"         # Run tests matching pattern
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5 (strict mode)
- **API Layer**: tRPC 11.4 (end-to-end type safety)
- **Database**: PostgreSQL + Drizzle ORM 0.43
- **Auth**: Better Auth 1.3 (email/password + Google OAuth, RBAC)
- **Payments**: Stripe 18.3 (subscriptions + one-time payments)
- **AI**: Vercel AI SDK (OpenAI, Anthropic, Google AI, xAI)
- **UI**: Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **State**: TanStack Query 5.83 + React Context
- **i18n**: next-intl 4.3 (zh/en server + client translations)
- **Code Quality**: Biome 2.2 (replaces ESLint/Prettier), Vitest, Playwright
- **Caching**: Redis (Upstash) for rate limiting and performance

### Layered Architecture Pattern

```
Presentation Layer (Next.js Pages + React Components)
       ↓
Business Logic Layer (Custom Hooks + Context Providers)
       ↓
API Gateway Layer (tRPC Routers + Middleware)
       ↓
Service Layer (Auth, Payment, AI, Email Services)
       ↓
Data Access Layer (Drizzle ORM + Schemas)
       ↓
Infrastructure (PostgreSQL, Redis, External APIs)
```

### Type Safety Chain
Database Schema (Drizzle) → tRPC Procedures → React Hooks → UI Components

### Critical Architecture Patterns

**1. tRPC Procedure Hierarchy**
```typescript
publicProcedure        // No auth required
  ↓
protectedProcedure     // Authenticated users only (checks session)
  ↓
adminProcedure         // adminLevel >= 1
  ↓
superAdminProcedure    // adminLevel >= 2
```
- Defined in: `src/server/server.ts`
- All business logic MUST go through tRPC procedures, not direct DB calls in components

**2. Authentication System (Better Auth)**
- Location: `src/lib/auth/better-auth/`
- Flow: Better Auth → tRPC Context → Middleware → Protected Routes
- Admin levels: 0=user, 1=admin, 2=super admin
- CRITICAL: `BETTER_AUTH_SECRET` requires 32+ characters
- Preferences stored as JSON strings in database (must parse/stringify)

**3. Database Layer (Drizzle ORM)**
- Schemas: `src/drizzle/schemas/` (organized by domain)
- Relations: `src/drizzle/schemas/relations.ts`
- Migrations: `src/drizzle/migrations/`
- ALWAYS use Drizzle queries, never raw SQL
- Schema changes require: modify schema → `pnpm db:generate` → `pnpm db:migrate`

**4. Component Conventions**
- Server Components by default (no 'use client')
- Client Components only when needed (state, hooks, browser APIs)
- shadcn/ui components in `src/components/ui/`
- Import aliases: `@/*` → `src/*`

**5. Internationalization**
```typescript
// Server Components
import { getTranslations } from 'next-intl/server'
const t = await getTranslations('namespace')

// Client Components
'use client'
import { useTranslations } from 'next-intl'
const t = useTranslations('namespace')
```
- Translation files: `src/translate/messages/zh.json` and `en.json`
- ALL user-facing text must be internationalized

**6. Feature-Based Organization**
- Components grouped by domain (auth, admin, ai-elements, front)
- Each domain has corresponding tRPC router in `src/server/routers/`
- Database schemas organized by business domain

## Key Directories

### Core Application Structure
```
src/
├── app/[locale]/              # Internationalized routes
│   ├── (front)/              # Public pages (marketing, landing)
│   ├── admin/                # Admin dashboard (users, blog, permissions, settings)
│   ├── auth/                 # Auth pages (login, register)
│   ├── docs/                 # Documentation (Fumadocs)
│   └── ai/                   # AI chat interface
│
├── server/                    # tRPC backend
│   ├── routers/              # API routes (auth, users, payments, aichat, blog, system)
│   └── server.ts            # tRPC setup + middleware
│
├── drizzle/schemas/          # Database schemas by domain
│   ├── users.ts             # User/auth tables
│   ├── payments.ts          # Subscriptions/billing
│   ├── aichat.ts            # AI sessions/messages
│   ├── blog.ts              # Blog posts
│   ├── system.ts            # Config/API keys
│   └── relations.ts         # Foreign key relations
│
├── lib/                      # Utilities and configuration
│   ├── ai-sdk/              # AI SDK setup (client, server, model-registry, streaming)
│   ├── auth/better-auth/    # Auth setup (server, client, permissions, roles)
│   ├── fumadocs/            # Documentation system
│   ├── validators/          # Zod schemas for validation
│   ├── db.ts               # Database connection
│   ├── stripe.ts           # Stripe client
│   ├── cache.ts            # Redis caching
│   └── rate-limiter.ts     # Rate limiting logic
```

## Critical Patterns to Follow

### When Adding New Features

1. **Create tRPC Router**: `src/server/routers/feature.ts`
2. **Define Database Schema**: `src/drizzle/schemas/feature.ts`
3. **Add Translations**: `src/translate/messages/zh.json` and `en.json`
4. **Generate Migration**: `pnpm db:generate`
5. **Update Types**: TypeScript will auto-infer, verify with `pnpm type-check`

### Code Standards (Biome)
- 80 character line width
- 2-space indentation
- Single quotes for strings
- Strict TypeScript (no `any` without justification)
- Import organization enforced
- Pre-commit hooks auto-format

### Common Gotchas

1. **Better Auth Secret**: Must be 32+ characters or auth will fail
2. **Database Preferences**: Stored as JSON strings, always parse before use
3. **Admin Levels**: Check user's `adminLevel` field (0/1/2), not boolean flags
4. **Server vs Client**: Can't use hooks in Server Components - add 'use client' when needed
5. **tRPC Context**: Contains `session` and `user` - use for auth checks
6. **Environment Variables**: Validated via `src/env.ts` (@t3-oss/env-nextjs)
7. **Migrations**: NEVER modify existing migration files, always generate new ones

### Testing Strategy
- Unit tests: Vitest + Testing Library (utils, components)
- Integration tests: tRPC routes + database operations
- E2E tests: Playwright for critical user flows
- Coverage target: 70%+
- Test files can be alongside source or in `/tests`

## Environment Configuration

### Required
```bash
DATABASE_URL                           # PostgreSQL connection string
STRIPE_SECRET_KEY                      # Stripe backend API key
STRIPE_WEBHOOK_SECRET                  # Stripe webhook signing secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY     # Stripe frontend key
BETTER_AUTH_SECRET                     # Min 32 chars, for session encryption
NEXT_PUBLIC_SITE_URL                   # Application URL
```

### Optional (but recommended)
```bash
# AI Services (at least one)
OPENAI_API_KEY
ANTHROPIC_API_KEY
GOOGLE_GENERATIVE_AI_API_KEY
XAI_API_KEY

# Caching & Performance
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# Email
RESEND_API_KEY

# OAuth
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

## Key Files to Reference

### Initial Understanding
1. `README.md` - Comprehensive project documentation (Chinese)
2. `src/env.ts` - Environment variable validation
3. `src/server/server.ts` - tRPC setup and middleware
4. `src/drizzle/schemas/index.ts` - Complete data model

### Authentication
- `src/lib/auth/better-auth/server.ts` - Auth configuration
- `src/lib/auth/better-auth/permissions.ts` - Permission checks
- `src/lib/auth/better-auth/roles.ts` - Role definitions

### Database
- `src/lib/db.ts` - Database connection
- `src/drizzle/schemas/*` - All table schemas

### Payments
- `src/lib/stripe.ts` - Stripe client setup
- `src/server/routers/payments.ts` - Payment logic
- `src/drizzle/schemas/payments.ts` - Payment tables

### AI Integration
- `src/lib/ai-sdk/server.ts` - Server-side AI utilities
- `src/lib/ai-sdk/model-registry.ts` - AI model configuration
- `src/server/routers/aichat.ts` - AI chat endpoints

## Development Workflow

### First-Time Setup
```bash
git clone <repo>
cd ai-saas-template
cp .env.example .env.local
# Configure DATABASE_URL and required API keys
pnpm install
pnpm db:generate && pnpm db:migrate
pnpm dev
```

### Making Changes
```bash
# 1. Check types frequently
pnpm type-check

# 2. Auto-fix code style
pnpm lint

# 3. Run tests
pnpm test

# 4. Full quality check before commit
pnpm ci
```

### Database Changes
```bash
# 1. Modify schema in src/drizzle/schemas/
# 2. Generate migration
pnpm db:generate
# 3. Review generated SQL in src/drizzle/migrations/
# 4. Apply migration
pnpm db:migrate
# 5. Verify in Drizzle Studio
pnpm db:studio
```

## Deployment

### Docker
- Multi-stage build defined in `Dockerfile`
- Standalone Next.js output for production
- Non-root user for security
- Environment variables injected at runtime
- Optimized for Vercel/Coolify/Railway

### Production Checklist
1. All environment variables configured
2. Database migrations applied
3. Stripe webhooks configured
4. Redis cache connected (optional but recommended)
5. Email service configured (for auth emails)
6. OAuth providers configured (if using)

## Reference Materials

- **Next.js 15 Docs**: https://nextjs.org/docs
- **tRPC Docs**: https://trpc.io/docs
- **Drizzle ORM Docs**: https://orm.drizzle.team/docs
- **Better Auth Docs**: https://www.better-auth.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **TanStack Query**: https://tanstack.com/query/latest
