# AI SaaS Template (Current Branch)

当前分支已从完整 SaaS 模板裁剪为一个可运行的 **Next.js 15 基础展示模板**，用于快速搭建首页样式和基础工程骨架。

## 当前状态

- 保留：Next.js App Router、React 19、Tailwind CSS v4、基础 UI 组件
- 保留：首页展示页面、全局 Provider、错误页、404 页
- 保留：健康检查与兼容会话接口

## 技术栈

- Next.js 15
- React 19
- TypeScript 5（strict）
- Tailwind CSS v4
- Biome 2


## 页面与接口

### 页面

- `/`：默认模板风格首页（Hero + CTA + 功能卡片）
- `/_not-found`：404 页面
- `/error`：运行时错误页面（由 App Router 错误边界触发）

### API

- `GET /api/health`
  - 返回服务状态、时间戳、运行时信息
- `GET /api/auth/get-session`
  - 兼容旧前端轮询请求
  - 当前固定返回：`{ "session": null, "user": null }`

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 环境变量

复制并按需修改：

```bash
cp .env.example .env
```

当前最小示例（见 `.env.example`）：

```bash
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> 当前分支不再进行 `env.ts` 强校验。

### 3. 启动开发

```bash
pnpm dev
```

默认端口 `3000`，若被占用会自动切换。

## 常用命令

```bash
pnpm dev            # 本地开发（Turbopack）
pnpm build          # 生产构建
pnpm start          # 启动生产服务
pnpm type-check     # TypeScript 检查
pnpm lint:check     # Biome 检查
pnpm lint           # Biome 检查并自动修复
pnpm test           # Vitest（允许无测试文件）
```

## 当前目录结构

```text
src/
├── app/
│   ├── api/
│   │   ├── auth/get-session/route.ts
│   │   └── health/route.ts
│   ├── error.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── components/
│   ├── common/global-providers.tsx
│   ├── home/home-page.tsx
│   └── ui/
│       ├── button.tsx
│       └── card.tsx
├── lib/utils.ts
└── types/common.ts
```

## 说明

- 本 README 仅描述当前分支实际保留内容。
- 若后续恢复认证、数据库、支付、国际化等模块，请同步更新 README。
