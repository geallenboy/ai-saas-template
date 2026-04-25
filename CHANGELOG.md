# Changelog

本文件记录 AI SaaS Template 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [2.0.0] - 2026 升级

### 核心框架升级
- Next.js 15.4.2 → 16.2.4 (major)
- React 19.1.0 → 19.2.5
- TypeScript 5 → 6.0.3 (major)
- tRPC 11.4.3 → 11.16.0
- Drizzle ORM 0.43.1 → 0.45.2
- better-auth 1.3.11 → 1.6.7
- Stripe 18.3.0 → 22.0.2 (major)
- AI SDK 5.0.47 → 6.0.168 (major)
- Zod 4.0.5 → 4.3.6

### UI 与工具链升级
- Tailwind CSS 4.1.11 → 4.2.4
- Vitest 3.2.4 → 4.1.5 (major)
- Biome 2.2.4 → 2.4.12
- fumadocs 15.8.5 → 16.8.2 (major)
- framer-motion 12.12.2 → 12.38.0
- shiki 3.13.0 → 4.0.2 (major)

### 新功能
- 邮箱验证流程
- 密码重置功能
- GitHub OAuth 支持
- 登录安全服务（IP 限流 + 账户锁定）
- AI 多模型切换
- AI Token 使用量追踪
- AI 使用配额控制
- 对话导出（Markdown/JSON）
- RAG 功能示例
- AI Agent 工作流示例
- Stripe Webhook 完整事件处理
- 订阅到期通知
- 优惠码系统
- 退款流程
- 管理仪表盘
- 用户搜索和批量操作
- 审计日志查看
- 系统配置管理
- 系统健康监控
- 结构化日志系统
- Sentry 错误追踪集成
- tRPC 性能追踪中间件
- API 文档
- tRPC Router 脚手架工具

### 移除
- axios（改用原生 fetch）
- react-syntax-highlighter（改用 shiki）
- marked（改用 react-markdown）
- tailwindcss-animate（改用 tw-animate-css）
- 15+ 个未使用的依赖包
- 冗余脚本和死代码

## [1.0.0] - 2025 初始版本

### 功能
- Next.js 15 App Router + React 19 全栈架构
- tRPC 端到端类型安全 API
- Drizzle ORM + PostgreSQL 数据层
- Better Auth 认证系统（邮箱密码 + Google OAuth）
- Stripe 订阅和一次性支付
- AI SDK 集成（OpenAI、Anthropic、Google AI、xAI）
- Tailwind CSS v4 + shadcn/ui 组件库
- next-intl 中英双语国际化
- Fumadocs 文档系统
- Biome 代码检查 + Vitest 测试
- Redis 缓存和限流
- RBAC 权限控制
