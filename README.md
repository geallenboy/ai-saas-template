# 🚀 AI SaaS Template

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596be?style=flat-square&logo=trpc)](https://trpc.io/)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-c5f74f?style=flat-square)](https://orm.drizzle.team/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**A Modern, Production-Ready AI SaaS Application Template**

Built with Next.js 15, featuring user authentication, payment systems, AI integration, internationalization, documentation system, and complete admin dashboard.

[🌟 Live Demo](https://aisaas.ailinksall.com/en) | [📖 Documentation](https://aisaas.ailinksall.com/en/docs) | [🎯 Quick Start](#-quick-start)

</div>

---

## ✨ Core Features

### 🔐 Authentication & Authorization System
- **Multiple Login Methods**: Email/password, OAuth (Google, GitHub, etc.)
- **Complete Auth Flow**: Registration, login, email verification, password reset, SSO callback
- **Permission Management**: Role-based access control (RBAC) with admin privileges
- **User Profile Management**: Personal info editing, avatar upload, skill level settings
- **Security Protection**: Middleware route protection, session management, CSRF protection

### 💳 Payment & Subscription System
- **Complete Stripe Integration**: Secure payment processing and subscription management
- **Flexible Membership Plans**: Monthly, yearly, enterprise plans with various options
- **Coupon System**: Percentage discounts and fixed amount discounts
- **Payment History**: Complete transaction records and invoice management
- **Multi-Currency Support**: USD, EUR, and other currencies

### 🤖 AI Feature Integration
- **Multi-AI Provider Support**: OpenAI, Anthropic, Google AI, xAI
- **Conversation Management**: Smart conversation history and context management
- **Prompt Templates**: Reusable AI prompt template system
- **Usage Limits**: AI usage quota management based on membership levels
- **API Key Management**: Secure API key storage and rotation

### 🌍 Internationalization Support
- **Multi-Language**: Chinese, English, easily extensible to more languages
- **Localized Content**: Complete content localization support
- **Dynamic Language Switching**: Language switching without page refresh
- **SEO Optimization**: Multi-language SEO and sitemap generation

### 📚 Documentation System
- **Fumadocs Integration**: Modern documentation generation and management
- **MDX Support**: Markdown documentation with React component support
- **Search Functionality**: Full-text search and intelligent suggestions
- **Version Control**: Documentation version management and history

### 🎨 Modern UI/UX
- **Shadcn/ui**: High-quality UI component library
- **Responsive Design**: Perfect adaptation for desktop, tablet, and mobile
- **Theme Switching**: Seamless light/dark theme switching
- **Animation Effects**: Smooth animations powered by Framer Motion
- **Accessibility Support**: WCAG 2.1 AA level accessibility design

### 🛠️ Developer Experience
- **TypeScript**: Complete type safety and intelligent hints
- **tRPC**: End-to-end type-safe API
- **Drizzle ORM**: Modern database ORM
- **Test Coverage**: Unit tests, integration tests, E2E tests
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks

### 📊 Monitoring & Analytics
- **Performance Monitoring**: Core Web Vitals and performance metrics
- **Error Tracking**: Sentry-integrated error monitoring
- **User Analytics**: Google Analytics integration
- **Logging System**: Structured logging and error reporting

---

## 🏗️ Technical Architecture

### Frontend Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui + Radix UI
- **State Management**: React Query + Zustand
- **Animation**: Framer Motion
- **Forms**: React Hook Form + Zod

### Backend Tech Stack
- **API**: tRPC 11 (Type-safe API)
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: Clerk (Multiple login methods)
- **Payment**: Stripe (Subscriptions and one-time payments)
- **Cache**: Upstash Redis
- **Email**: Resend / SMTP

### AI Integration
- **OpenAI**: GPT-4, GPT-5
- **Anthropic**: Claude 4 Sonnet
- **Google AI**: Gemini Pro
- **xAI**: Grok

### Deployment & Operations
- **Deployment**: Vercel / Docker
- **Database**: Neon / Supabase / PlanetScale
- **CDN**: Cloudflare
- **Monitoring**: Sentry + Custom monitoring
- **CI/CD**: GitHub Actions

---

## 📁 Project Structure

```
ai-saas-template/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # Internationalization routes
│   │   │   ├── (front)/       # Frontend pages
│   │   │   ├── admin/         # Admin dashboard
│   │   │   ├── auth/          # Authentication pages
│   │   │   └── docs/          # Documentation pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── payment/           # Payment components
│   │   ├── ui/                # UI components
│   │   ├── blocks/            # Page blocks
│   │   └── layout/            # Layout components
│   ├── lib/                   # Utility libraries
│   │   ├── trpc/              # tRPC configuration
│   │   ├── db.ts              # Database configuration
│   │   ├── stripe.ts          # Stripe configuration
│   │   └── utils.ts           # Utility functions
│   ├── drizzle/               # Database
│   │   ├── schemas/           # Database table definitions
│   │   └── migrations/        # Database migrations
│   ├── types/                 # TypeScript types
│   ├── hooks/                 # React Hooks
│   ├── constants/             # Constants configuration
│   ├── translate/             # Internationalization
│   └── content/               # Content files
│       ├── docs/              # Documentation content
│       └── blog/              # Blog content
├── public/                    # Static assets
├── tests/                     # Test files
└── scripts/                   # Script files
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17+ 
- pnpm 8.0+
- PostgreSQL 14+
- Redis (optional, for caching)

### 1. Clone the Project

```bash
git clone https://github.com/alexzanco/ai-saas-template.git
cd ai-saas-template
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Copy the environment variable template:

```bash
cp .env.example .env.local
```

Configure required environment variables:

```bash
# Database Configuration (Required)
DATABASE_URL="postgresql://username:password@localhost:5432/ai_saas"

# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Stripe Payment (Required)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AI API Keys (Configure at least one)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_GENERATIVE_AI_API_KEY="..."
XAI_API_KEY="..."

# Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Redis Cache (Optional)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Email Service (Optional)
RESEND_API_KEY="re_..."
```

### 4. Database Setup

Generate database migrations:

```bash
pnpm db:generate
```

Run database migrations:

```bash
pnpm db:migrate
```

Initialize system configuration:

```bash
pnpm db:push
```

### 5. Start Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📝 Available Scripts

### Development Commands

```bash
pnpm dev          # Start development server (Turbo mode)
pnpm build        # Build production version
pnpm start        # Start production server
pnpm type-check   # TypeScript type checking
```

### Code Quality

```bash
pnpm lint         # Code linting and auto-fix
pnpm lint:check   # Check code quality only
pnpm format       # Code formatting
pnpm format:check # Check code formatting
```

### Testing Commands

```bash
pnpm test              # Run all tests
pnpm test:dev          # Run tests in watch mode
pnpm test:coverage     # Generate test coverage report
pnpm test:unit         # Run unit tests
pnpm test:integration  # Run integration tests
pnpm test:e2e          # Run end-to-end tests
```

### Database Commands

```bash
pnpm db:generate  # Generate database migration files
pnpm db:migrate   # Run database migrations
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
```

### Quality Checks

```bash
pnpm ci                # CI pipeline checks
pnpm quality:check     # Complete quality check
pnpm quality:fix       # Fix quality issues
```

---

## 🔧 Configuration Guide

### Authentication Configuration

1. Create an application on [Clerk](https://clerk.com)
2. Configure OAuth providers (Google, GitHub, etc.)
3. Set webhook endpoint: `https://yourdomain.com/api/webhook/clerk`
4. Copy API keys to environment variables

### Payment Configuration

1. Create an account on [Stripe](https://stripe.com)
2. Configure products and pricing
3. Set webhook endpoint: `https://yourdomain.com/api/webhook/stripe`
4. Configure payment methods and currencies

### AI Service Configuration

Choose and configure at least one AI provider:

- **OpenAI**: Get API key from [OpenAI Platform](https://platform.openai.com)
- **Anthropic**: Get API key from [Anthropic Console](https://console.anthropic.com)
- **Google AI**: Get API key from [Google AI Studio](https://aistudio.google.com)
- **xAI**: Get API key from [xAI Console](https://console.x.ai)

### Database Configuration

Supports multiple PostgreSQL providers:

- **Neon**: Serverless PostgreSQL
- **Supabase**: Open-source Firebase alternative
- **PlanetScale**: MySQL-compatible serverless database
- **Railway**: Simple cloud database
- **Local PostgreSQL**: For development environment

---

## 🚀 Deployment Guide

### Coolify Deployment (Recommended for Self-Hosting)

Deploy easily with Coolify using Nixpacks:

1. **Quick Setup**: Project includes `nixpacks.toml` for automatic configuration
2. **Environment Variables**: Copy from `.env.coolify` to your Coolify dashboard
3. **One-Click Deploy**: Coolify handles the rest automatically

```bash
# Run the fix script if you encounter issues
./scripts/fix-coolify-deployment.sh
```

📖 **[Complete Coolify Deployment Guide](docs/COOLIFY_DEPLOYMENT.md)**

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy application

```bash
# Using Vercel CLI
npx vercel --prod
```

### Docker Deployment

```bash
# Build image
docker build -t ai-saas-template .

# Run container
docker run -p 3000:3000 --env-file .env.local ai-saas-template
```

### Environment Variables Checklist

Ensure the following environment variables are configured before deployment:

- [ ] `DATABASE_URL` - Database connection string
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- [ ] `CLERK_SECRET_KEY` - Clerk secret key
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- [ ] At least one AI API key
- [ ] `NEXT_PUBLIC_SITE_URL` - Site URL

---

## 🧪 Testing

### Testing Strategy

The project adopts a multi-layered testing strategy:

- **Unit Tests**: Test independent functions and components
- **Integration Tests**: Test interactions between components
- **E2E Tests**: Test complete user workflows

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:dev

# Generate coverage report
pnpm test:coverage

# Run specific tests
pnpm test auth.test.ts
```

### Test Coverage Goals

- Overall coverage: ≥ 80%
- Core business logic: ≥ 90%
- Utility functions: ≥ 95%

---

## 🔒 Security Best Practices

### Authentication Security
- Use HTTPS transmission
- Implement CSRF protection
- Session timeout management
- Multi-factor authentication support

### Data Security
- Encrypt sensitive data storage
- SQL injection protection
- XSS attack protection
- Input validation and sanitization

### API Security
- Rate limiting
- API key rotation
- Request signature verification
- Error message sanitization

---

## 📈 Performance Optimization

### Frontend Optimization
- Code splitting and lazy loading
- Image optimization and WebP format
- Static asset CDN acceleration
- Service Worker caching

### Backend Optimization
- Database query optimization
- Redis caching strategy
- API response compression
- Connection pool management

### Monitoring Metrics
- Core Web Vitals
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

---

## 🤝 Contributing

### Development Workflow

1. Fork the project
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Create Pull Request

### Code Standards

- Use TypeScript for type-safe development
- Follow ESLint and Prettier configurations
- Write tests covering new features
- Update relevant documentation

### Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add new feature
fix: fix issue
docs: update documentation
style: code formatting adjustment
refactor: code refactoring
test: add tests
chore: build process or auxiliary tool changes
```

---

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

Thanks to the following open-source projects and services:

- [Next.js](https://nextjs.org/) - React full-stack framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - UI component library
- [tRPC](https://trpc.io/) - Type-safe API
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Clerk](https://clerk.com/) - Authentication service
- [Stripe](https://stripe.com/) - Payment processing
- [Fumadocs](https://fumadocs.vercel.app/) - Documentation generation

---

## 📞 Support

If you encounter any issues while using this project, you can get help through:

- 📧 Email: [alex.zanco@icloud.com](mailto:alex.zanco@icloud.com)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/alexzanco/ai-saas-template.git/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/alexzanco/ai-saas-template.git/discussions)

---

<div align="center">

**⭐ If this project helps you, please give us a Star!**

[⬆ Back to Top](#-ai-saas-template)

</div>