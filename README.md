# AI SaaS Template (Current Branch)

当前分支已切换为可运行的 **Vite + React 19 基础展示模板**，用于快速搭建首页样式和基础工程骨架。

## 当前状态

- 保留：Vite、React 19、Tailwind CSS v4、基础 UI 组件
- 保留：首页展示页面、全局 Provider、404 页面
- 保留：健康检查与兼容会话接口（开发与生产启动均可用）

## 技术栈

- Vite 6
- React 19
- TypeScript 5（strict）
- Tailwind CSS v4
- Biome 2

## 页面与接口

### 页面

- `/`：默认模板风格首页（Hero + CTA + 功能卡片）
- `*`：404 页面（React Router）

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
VITE_SITE_URL=http://localhost:3000
```

### 3. 启动开发

```bash
pnpm dev
```

默认端口 `3000`。

## 常用命令

```bash
pnpm dev            # 本地开发（Vite）
pnpm build          # 生产构建（输出 dist）
pnpm preview        # 本地预览 dist（Vite preview）
pnpm start          # Node 静态服务 + 兼容 API
pnpm type-check     # TypeScript 检查
pnpm lint:check     # Biome 检查
pnpm lint           # Biome 检查并自动修复
pnpm test           # Vitest（允许无测试文件）
```

## 当前目录结构

```text
src/
├── App.tsx
├── main.tsx
├── pages/
│   └── not-found-page.tsx
├── styles/
│   └── globals.css
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

- 当前分支已移除 Next.js App Router 与 Next API Route。
- 兼容 API 由 `vite.config.ts`（dev/preview）与 `scripts/preview-server.mjs`（start）提供。

## 从 Next.js 迁移到 Vite

### 主要变化

- 入口从 `src/app/layout.tsx + page.tsx` 改为 `index.html + src/main.tsx + src/App.tsx`
- 路由从 Next App Router 改为 React Router
- 构建产物从 `.next` 改为 `dist`
- 开发与预览改为 Vite（`pnpm dev` / `pnpm preview`）
- 生产启动改为 Node 静态服务（`pnpm start`）

### 兼容性影响

- 不再支持 Next.js 的 SSR、`metadata`、App Router 约定式文件路由
- 如需恢复服务端渲染能力，建议拆分为独立后端服务或回迁 SSR 框架
