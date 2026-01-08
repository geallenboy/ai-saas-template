#!/usr/bin/env tsx
/**
 * Blog测试数据种子脚本
 * 使用方法: pnpm tsx scripts/seed-blog.ts
 */

// 加载环境变量
import { config } from 'dotenv'
config()

import { db } from '@/lib/db'
import { blogPosts, users } from '@/drizzle/schemas'
import { eq } from 'drizzle-orm'

const testBlogPosts = [
  {
    title: 'Next.js 15 新特性详解',
    slug: 'nextjs-15-new-features',
    summary: '深入了解 Next.js 15 带来的革命性更新，包括 App Router、Server Components 等新特性。',
    content: `# Next.js 15 新特性详解

Next.js 15 带来了许多令人兴奋的新特性，让我们一起来看看。

## App Router

App Router 是 Next.js 13 引入的新路由系统，在 Next.js 15 中进一步完善。它基于 React Server Components，提供了更好的性能和开发体验。

### 主要优势

1. **服务器组件优先**: 默认所有组件都是服务器组件
2. **流式渲染**: 支持 Suspense 边界的流式渲染
3. **数据获取**: 更简单的数据获取方式

## Turbopack

Turbopack 是 Webpack 的继任者，提供了极快的构建速度。

## 结论

Next.js 15 为现代 Web 开发带来了巨大的改进。`,
    coverImageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
    tags: ['Next.js', 'React', 'Web开发'],
    isFeatured: true,
    status: 'published' as const,
    locale: 'zh',
  },
  {
    title: 'tRPC 完全指南：端到端类型安全',
    slug: 'trpc-complete-guide',
    summary: '学习如何使用 tRPC 构建类型安全的全栈应用，告别 REST API 的类型烦恼。',
    content: `# tRPC 完全指南

tRPC 让你可以在 TypeScript 项目中实现端到端的类型安全。

## 什么是 tRPC？

tRPC 允许你在不编写任何模式或代码生成的情况下，在客户端和服务器之间共享类型。

## 核心概念

### Procedures

Procedures 是 tRPC 的核心构建块：

- **Query**: 用于读取数据
- **Mutation**: 用于修改数据
- **Subscription**: 用于实时数据流

### 中间件

中间件可以在 procedure 执行前后添加逻辑。

## 最佳实践

1. 使用 Zod 进行输入验证
2. 合理组织路由结构
3. 利用中间件处理认证授权

## 总结

tRPC 是构建类型安全全栈应用的最佳选择。`,
    coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
    tags: ['tRPC', 'TypeScript', 'API'],
    isFeatured: true,
    status: 'published' as const,
    locale: 'zh',
  },
  {
    title: 'Drizzle ORM：现代化的 TypeScript ORM',
    slug: 'drizzle-orm-modern-typescript-orm',
    summary: 'Drizzle ORM 是一个轻量级、类型安全的 ORM，专为 TypeScript 设计。',
    content: `# Drizzle ORM：现代化的 TypeScript ORM

Drizzle 是一个全新的 TypeScript ORM，提供了出色的类型推断和开发体验。

## 为什么选择 Drizzle？

### 性能优异

Drizzle 生成的查询非常接近原生 SQL，性能损耗极小。

### 类型安全

完全的类型推断，让你在编写查询时就能发现错误。

\`\`\`typescript
// 自动推断返回类型
const users = await db.select().from(userTable)
\`\`\`

### 迁移管理

内置的迁移系统让数据库版本管理变得简单。

## Schema 定义

\`\`\`typescript
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
})
\`\`\`

## 总结

如果你在寻找一个现代化的 TypeScript ORM，Drizzle 是不二之选。`,
    coverImageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d',
    tags: ['Drizzle', 'ORM', 'TypeScript', '数据库'],
    isFeatured: false,
    status: 'published' as const,
    locale: 'zh',
  },
  {
    title: 'AI SaaS 应用架构设计',
    slug: 'ai-saas-architecture-design',
    summary: '如何设计一个可扩展的 AI SaaS 应用架构，包括认证、支付、AI 集成等核心功能。',
    content: `# AI SaaS 应用架构设计

构建一个成功的 AI SaaS 应用需要精心设计的架构。

## 分层架构

### 表示层
- Next.js App Router
- React Server Components
- shadcn/ui 组件库

### 业务逻辑层
- tRPC 路由和中间件
- 自定义 React Hooks
- Context Providers

### 数据访问层
- Drizzle ORM
- PostgreSQL
- Redis 缓存

### 基础设施层
- Better Auth 认证
- Stripe 支付
- OpenAI/Anthropic API

## 核心功能模块

### 认证系统
使用 Better Auth 实现邮箱密码登录和 OAuth。

### 支付系统
集成 Stripe 订阅和一次性支付。

### AI 集成
通过 Vercel AI SDK 支持多个 AI 提供商。

## 安全考虑

1. 环境变量验证
2. CSRF 保护
3. 速率限制
4. SQL 注入防护

## 性能优化

- Redis 缓存
- 服务器组件减少客户端 JavaScript
- 图片优化
- 代码分割

## 总结

良好的架构设计是 AI SaaS 成功的基础。`,
    coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
    tags: ['AI', 'SaaS', '架构设计', 'Next.js'],
    isFeatured: true,
    status: 'published' as const,
    locale: 'zh',
  },
  {
    title: 'Stripe 订阅支付集成实战',
    slug: 'stripe-subscription-integration',
    summary: '从零开始在你的 SaaS 应用中集成 Stripe 订阅支付功能。',
    content: `# Stripe 订阅支付集成实战

Stripe 是最流行的在线支付平台，本文将教你如何集成订阅功能。

## 前期准备

1. 注册 Stripe 账号
2. 获取 API 密钥
3. 配置 Webhook

## 创建产品和价格

在 Stripe Dashboard 中创建产品和定价方案。

## 后端集成

### 创建订阅会话

\`\`\`typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{
    price: priceId,
    quantity: 1,
  }],
  success_url: 'https://your-site.com/success',
  cancel_url: 'https://your-site.com/cancel',
})
\`\`\`

### 处理 Webhook

监听 Stripe 事件来同步订阅状态。

## 前端集成

使用 Stripe Elements 创建支付表单。

## 测试

使用 Stripe 测试卡号进行测试：
- 成功: 4242 4242 4242 4242
- 失败: 4000 0000 0000 0002

## 生产环境

1. 切换到生产密钥
2. 配置生产环境 Webhook
3. 启用 3D Secure

## 总结

Stripe 提供了强大而灵活的支付解决方案。`,
    coverImageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d',
    tags: ['Stripe', '支付', 'SaaS', '订阅'],
    isFeatured: false,
    status: 'published' as const,
    locale: 'zh',
  },
  {
    title: 'Building Modern Web Apps with Next.js 15',
    slug: 'building-modern-web-apps-nextjs-15',
    summary: 'Learn how to build modern, performant web applications using Next.js 15 and the latest React features.',
    content: `# Building Modern Web Apps with Next.js 15

Next.js 15 introduces groundbreaking features that revolutionize web development.

## App Router Fundamentals

The App Router represents a paradigm shift in how we build Next.js applications.

### Server Components by Default

All components are Server Components by default, reducing JavaScript bundle size.

### Nested Layouts

Create complex layouts with ease using nested layout components.

## Data Fetching Patterns

### Server-Side Data Fetching

\`\`\`typescript
async function getData() {
  const res = await fetch('https://api.example.com/data')
  return res.json()
}

export default async function Page() {
  const data = await getData()
  return <div>{data.title}</div>
}
\`\`\`

### Streaming with Suspense

Improve perceived performance with streaming.

## Performance Optimization

- Image Optimization
- Font Optimization
- Script Optimization
- Lazy Loading

## Deployment

Deploy to Vercel with zero configuration.

## Conclusion

Next.js 15 sets the new standard for web development.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
    tags: ['Next.js', 'React', 'Web Development', 'JavaScript'],
    isFeatured: true,
    status: 'published' as const,
    locale: 'en',
  },
  {
    title: 'TypeScript Best Practices in 2026',
    slug: 'typescript-best-practices-2026',
    summary: 'Essential TypeScript patterns and practices for writing maintainable, type-safe code.',
    content: `# TypeScript Best Practices in 2026

TypeScript has become the de facto standard for JavaScript development.

## Strict Mode Configuration

Always enable strict mode in \`tsconfig.json\`:

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
\`\`\`

## Type Inference

Let TypeScript infer types when possible:

\`\`\`typescript
// Good
const user = { name: 'John', age: 30 }

// Unnecessary
const user: { name: string; age: number } = { name: 'John', age: 30 }
\`\`\`

## Utility Types

Leverage built-in utility types:

- \`Partial<T>\`
- \`Required<T>\`
- \`Pick<T, K>\`
- \`Omit<T, K>\`

## Generic Functions

Write reusable, type-safe functions:

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg
}
\`\`\`

## Avoid Any

Never use \`any\` unless absolutely necessary. Use \`unknown\` instead.

## Discriminated Unions

Create type-safe state machines:

\`\`\`typescript
type State =
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; error: Error }
\`\`\`

## Conclusion

Following these practices will make your TypeScript code more maintainable and robust.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea',
    tags: ['TypeScript', 'Best Practices', 'JavaScript', 'Programming'],
    isFeatured: false,
    status: 'published' as const,
    locale: 'en',
  },
  {
    title: 'React 19 测试版新特性',
    slug: 'react-19-beta-features',
    summary: 'React 19 带来了令人兴奋的新特性，包括 Actions、Server Components 改进等。',
    content: `# React 19 测试版新特性

React 19 目前处于测试阶段，让我们看看有哪些新特性。

## Actions

Actions 简化了表单处理和数据变更。

\`\`\`typescript
function UpdateName() {
  async function updateName(formData: FormData) {
    'use server'
    const name = formData.get('name')
    await db.update({ name })
  }

  return (
    <form action={updateName}>
      <input name="name" />
      <button type="submit">Update</button>
    </form>
  )
}
\`\`\`

## useOptimistic Hook

实现乐观更新变得更简单。

## Server Components 改进

- 更好的性能
- 更简单的数据获取
- 减少客户端 JavaScript

## use Hook

新的 \`use\` Hook 可以读取 Promise 和 Context。

## Document Metadata

直接在组件中设置 meta 标签。

## 资源加载

更智能的资源预加载机制。

## 总结

React 19 为现代 Web 开发带来了更多可能。`,
    coverImageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
    tags: ['React', 'React 19', 'JavaScript', '前端'],
    isFeatured: false,
    status: 'draft' as const,
    locale: 'zh',
  },
]

async function main() {
  console.log('开始插入 Blog 测试数据...\n')

  // 获取第一个管理员用户作为作者
  const adminUser = await db.query.users.findFirst({
    where: eq(users.adminLevel, 1),
  })

  if (!adminUser) {
    console.error('❌ 错误: 未找到管理员用户。请先创建一个管理员账号。')
    console.log('提示: 可以在数据库中手动将某个用户的 admin_level 设置为 1')
    process.exit(1)
  }

  console.log(`✓ 找到管理员用户: ${adminUser.email} (ID: ${adminUser.id})\n`)

  let successCount = 0
  let errorCount = 0

  for (const post of testBlogPosts) {
    try {
      const now = new Date()
      const publishedAt = post.status === 'published' ? now : null

      await db.insert(blogPosts).values({
        ...post,
        authorId: adminUser.id,
        publishedAt,
        readingMinutes: Math.ceil(post.content.length / 1000), // 简单估算
        createdAt: now,
        updatedAt: now,
      })

      successCount++
      console.log(`✓ 创建文章: ${post.title} (${post.locale}, ${post.status})`)
    } catch (error) {
      errorCount++
      console.error(`✗ 创建失败: ${post.title}`)
      console.error(`  错误: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  console.log(`\n完成! 成功: ${successCount}, 失败: ${errorCount}`)
  console.log('\n可以通过以下方式查看:')
  console.log('1. 管理后台: http://localhost:3000/admin/blog')
  console.log('2. Drizzle Studio: pnpm db:studio')
}

main()
  .then(() => {
    console.log('\n✓ 数据库种子数据插入完成')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n✗ 发生错误:', error)
    process.exit(1)
  })
