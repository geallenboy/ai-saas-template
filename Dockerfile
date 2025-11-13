# 多阶段构建优化
FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件
COPY package.json pnpm-lock.yaml* ./

# 安装所有依赖，跳过 postinstall 脚本（避免缺少源文件的错误）
# postinstall 会在 builder 阶段有完整源码后再运行
RUN pnpm install --frozen-lockfile --ignore-scripts

# 构建阶段
FROM base AS builder
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 运行 postinstall 脚本（fumadocs-mdx 生成类型）
RUN pnpm run postinstall || true

# 构建应用
# 注意: 环境变量会在运行时通过 Coolify 注入，构建时会自动跳过验证
RUN pnpm run build

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建系统用户和组
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制必要的文件
# 1. 复制 public 目录（如果存在）
COPY --from=builder /app/public ./public

# 2. 复制 standalone 输出（包含所有运行时需要的文件）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 3. 复制静态文件
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置运行时环境变量
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 启动应用
CMD ["node", "server.js"]