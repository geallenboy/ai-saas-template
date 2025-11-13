# 🚀 AI SaaS Template

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-398CCB?logo=trpc&logoColor=white)](https://trpc.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> 🎯 **现代化企业级 AI SaaS 解决方案** - 基于 Next.js 15、React 19、TypeScript 和 tRPC 构建的全栈开发模板

## ✨ 核心特性

### 🏗️ 现代化技术栈
- **🔥 Next.js 15** - App Router + Server Components + React 19
- **🛡️ TypeScript 5** - 端到端类型安全，严格模式配置
- **🌐 tRPC** - 类型安全的全栈API，零代码生成
- **🎨 Tailwind CSS v4** - 现代化CSS框架 + shadcn/ui组件库
- **🗄️ Drizzle ORM** - 类型安全的PostgreSQL ORM
- **🔐 Better Auth** - 轻量级认证解决方案，支持多种登录方式

### 🚀 企业级功能
- **👥 用户管理系统** - 完整的RBAC权限控制（用户/管理员/超级管理员）
- **💳 支付集成** - Stripe订阅和一次性支付
- **🌍 国际化支持** - 中英双语，支持服务端渲染
- **🤖 AI服务集成** - 支持 OpenAI、Anthropic、Google AI、xAI
- **📊 系统监控** - 完整的审计日志和系统配置
- **📱 响应式设计** - 移动端适配，支持深色模式

### ⚡ 开发体验
- **🔧 完整工具链** - Biome代码检查、Vitest测试、Playwright E2E
- **📝 严格规范** - Git hooks、代码格式化、提交规范
- **🔍 类型安全** - 从数据库到前端的完整类型推断
- **🚀 高性能** - 代码分割、图片优化、缓存策略
- **📚 完整文档** - 详细的开发规范和架构说明

## 🎯 架构设计

### 分层架构
```
┌─────────────────────────────────────────────┐
│  表现层 (Presentation Layer)                │
│  React Components + shadcn/ui               │
├─────────────────────────────────────────────┤
│  业务逻辑层 (Business Logic Layer)          │
│  Custom Hooks + Context + Services          │
├─────────────────────────────────────────────┤
│  API网关层 (API Gateway Layer)              │
│  tRPC Routers + Middleware                  │
├─────────────────────────────────────────────┤
│  服务层 (Service Layer)                     │
│  Auth + Payment + AI + Email Services       │
├─────────────────────────────────────────────┤
│  数据访问层 (Data Access Layer)             │
│  Drizzle ORM + Database Schemas             │
├─────────────────────────────────────────────┤
│  基础设施层 (Infrastructure Layer)          │
│  PostgreSQL + Redis + External APIs         │
└─────────────────────────────────────────────┘
```

### 技术特点
- **🔄 端到端类型安全**: TypeScript + tRPC + Drizzle完整类型链
- **🎛️ 分层权限控制**: 公开 → 认证 → 管理员 → 超级管理员
- **🌐 微服务就绪**: 按业务域分离的tRPC路由设计
- **📈 性能优化**: RSC + 智能缓存 + 代码分割
- **🔒 安全设计**: Better Auth + RBAC + 环境变量验证

## 🚀 快速开始

### 环境要求
- **Node.js** >= 18.17.0
- **pnpm** >= 8.0.0  
- **PostgreSQL** >= 14.0

### 1. 克隆项目
```bash
git clone https://github.com/geallenboy/ai-saas-template
cd ai-saas-template
```

### 2. 安装依赖
```bash
pnpm install
```

### 3. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env.local

# 配置必需的环境变量
DATABASE_URL="postgresql://username:password@localhost:5432/ai_saas"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4. 数据库设置
```bash
# 生成数据库迁移
pnpm db:generate

# 执行数据库迁移
pnpm db:migrate

# 打开数据库管理面板（可选）
pnpm db:studio
```

### 5. 启动开发服务器
```bash
# 启动开发环境（使用Turbo）
pnpm dev

# 或普通模式启动
pnpm dev --no-turbo
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📖 开发指南

### 常用命令
```bash
# 开发环境
pnpm dev                    # 启动开发服务器（Turbo模式）
pnpm build                  # 生产构建
pnpm start                  # 启动生产服务器

# 代码质量
pnpm lint                   # 代码检查并自动修复
pnpm lint:check             # 仅检查，不修复
pnpm format                 # 代码格式化
pnpm type-check             # TypeScript类型检查

# 测试
pnpm test                   # 运行所有测试
pnpm test:dev               # 监听模式运行测试
pnpm test:ui                # 打开Vitest UI界面
pnpm test:coverage          # 生成测试覆盖率报告
pnpm test:e2e               # 运行E2E测试

# 数据库
pnpm db:generate            # 生成迁移文件
pnpm db:migrate             # 执行迁移
pnpm db:studio              # 打开Drizzle Studio
pnpm db:push                # 推送schema到数据库

# 质量检查
pnpm ci                     # CI环境完整检查
pnpm quality:check          # 完整质量检查（类型+规范+测试+覆盖率）
pnpm quality:fix            # 修复所有可修复的质量问题
```

### 项目结构
```
src/
├── app/                    # Next.js App Router页面
├── components/             # React组件
│   ├── ui/                # shadcn/ui基础组件
│   ├── auth/              # 认证相关组件
│   ├── payment/           # 支付相关组件
│   └── ...                # 其他业务组件
├── server/                # tRPC服务端代码
│   ├── routers/           # API路由定义
│   └── middleware/        # 中间件
├── lib/                   # 工具库和配置
├── drizzle/               # 数据库schema和迁移
├── hooks/                 # 自定义React hooks
├── types/                 # TypeScript类型定义
└── translate/             # 国际化配置和翻译文件
```

## 🔧 核心功能

### 用户认证系统
- **🔐 多种登录方式**: 邮箱密码、Google OAuth
- **👤 用户管理**: 注册、登录、密码重置、邮箱验证
- **🛡️ 权限控制**: 基于角色的访问控制（RBAC）
- **🔒 会话管理**: 安全的session处理，支持跨域

### 支付订阅系统
- **💳 Stripe集成**: 订阅、一次性支付、发票管理
- **📊 会员管理**: 会员状态、使用量追踪、到期提醒
- **🎫 优惠券系统**: 折扣码、促销活动支持
- **💰 多币种**: 支持多种货币和支付方式

### AI服务集成
- **🤖 多供应商**: OpenAI、Anthropic、Google AI、xAI
- **⚖️ 负载均衡**: 智能路由和故障转移
- **💰 成本优化**: 动态模型选择和使用量控制
- **🔄 流式响应**: 实时响应流处理

### 系统管理
- **📋 审计日志**: 完整的用户操作记录
- **⚙️ 系统配置**: 动态配置管理
- **📊 使用统计**: 用户活跃度、功能使用分析
- **🚨 监控告警**: 系统健康状态监控

## 🌍 国际化

项目支持完整的国际化功能：

### 支持语言
- **🇨🇳 中文（简体）** - 默认语言
- **🇺🇸 English** - 英语

### 使用方式
```typescript
// 服务端组件
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('common')
  return <h1>{t('welcome')}</h1>
}

// 客户端组件
'use client'
import { useTranslations } from 'next-intl'

export function Component() {
  const t = useTranslations('common')
  return <button>{t('actions.save')}</button>
}
```

### 翻译文件结构
```
src/translate/messages/
├── zh.json                 # 中文翻译
└── en.json                 # 英文翻译
```

## 🔒 环境变量配置

### 必需配置
```bash
# 数据库连接
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Stripe支付
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# 认证配置
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 可选配置
```bash
# AI服务（至少配置一个）
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_GENERATIVE_AI_API_KEY="..."
XAI_API_KEY="..."

# Redis缓存
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# 邮件服务
RESEND_API_KEY="re_..."

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# 监控分析
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
SENTRY_DSN="https://..."
```

## 🧪 测试

### 测试策略
- **⚡ 单元测试**: 工具函数和组件逻辑测试
- **🔗 集成测试**: API路由和数据库操作测试
- **🌐 E2E测试**: 完整用户流程测试
- **📊 覆盖率**: 目标覆盖率70%+

### 运行测试
```bash
# 单元测试
pnpm test:unit

# 集成测试  
pnpm test:integration

# E2E测试
pnpm test:e2e

# 测试覆盖率
pnpm test:coverage

# 监听模式
pnpm test:dev
```

## 📈 性能优化

### 已实现优化
- **🚀 React Server Components**: 减少客户端JavaScript
- **⚡ 代码分割**: 按路由自动分割，减少初始加载
- **🖼️ 图片优化**: Next.js Image自动WebP/AVIF转换
- **🗄️ 智能缓存**: TanStack Query + Redis多层缓存
- **📦 Bundle优化**: Tree shaking + 第三方库优化

### 性能指标
- **⚡ First Contentful Paint**: < 1.5s
- **🎯 Largest Contentful Paint**: < 2.5s
- **📱 Cumulative Layout Shift**: < 0.1
- **⚡ Time to Interactive**: < 3.5s

## 🚀 部署

### Vercel部署（推荐）
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### Docker部署
```bash
# 构建镜像
docker build -t ai-saas .

# 运行容器
docker run -p 3000:3000 ai-saas
```

### 环境要求
- **Node.js**: >= 18.17.0
- **PostgreSQL**: >= 14.0
- **Redis**: >= 6.0（可选，用于缓存）

## 🤝 贡献指南

我们欢迎任何形式的贡献！

### 参与方式
1. **🍴 Fork** 本仓库
2. **🌿 创建** 特性分支 (`git checkout -b feature/amazing-feature`)
3. **💾 提交** 更改 (`git commit -m 'Add amazing feature'`)
4. **📤 推送** 分支 (`git push origin feature/amazing-feature`)
5. **📝 创建** Pull Request

### 开发规范
- 遵循现有的代码风格和架构模式
- 添加适当的测试用例
- 更新相关文档
- 确保所有检查通过 (`pnpm ci`)

### 提交规范
```bash
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建/工具相关
```

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 🙏 致谢

感谢以下优秀的开源项目：

- [Next.js](https://nextjs.org/) - React全栈框架
- [tRPC](https://trpc.io/) - 端到端类型安全API
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Better Auth](https://www.better-auth.com/) - 现代认证解决方案
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [shadcn/ui](https://ui.shadcn.com/) - 组件库
- [TanStack Query](https://tanstack.com/query) - 数据获取库

## 📞 支持

- **📚 文档**: 查看 [CLAUDE.md](CLAUDE.md) 了解详细开发指南
- **🐛 问题反馈**: [GitHub Issues](https://github.com/geallenboy/ai-saas-template/issues)
- **💬 讨论**: [GitHub Discussions](https://github.com/geallenboy/ai-saas-template/discussions)
- **📧 联系**: gejialun88@gmail.com

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个Star支持一下！⭐**

</div>
