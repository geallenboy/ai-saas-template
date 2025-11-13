# Coolify 部署检查清单

## ✅ 部署前检查

### 1. 代码配置
- [x] `next.config.ts` 已配置 `output: 'standalone'`
- [x] Dockerfile 使用多阶段构建
- [x] .dockerignore 已配置正确
- [x] package.json 包含所有必需的依赖
- [x] 环境变量验证逻辑正确（构建时自动跳过）

### 2. Coolify 设置
- [ ] 选择 **Dockerfile** 作为 Build Pack（不要用 Nixpacks）
- [ ] 配置正确的 Git 分支（通常是 `main` 或 `master`）
- [ ] 启用 Auto Deploy（可选，推荐）
- [ ] 配置域名和 SSL 证书

### 3. 环境变量（必需）

#### 应用基础
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_SITE_URL=https://your-domain.com`

#### 数据库
- [ ] `DATABASE_URL=postgresql://...`

#### 认证
- [ ] `BETTER_AUTH_SECRET`（至少 32 个字符）
- [ ] `BETTER_AUTH_URL=https://your-domain.com`

#### 支付
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

#### AI API（至少一个）
- [ ] `OPENAI_API_KEY` 或
- [ ] `ANTHROPIC_API_KEY` 或
- [ ] `GOOGLE_GENERATIVE_AI_API_KEY`

### 4. 可选环境变量

#### 缓存和限流
- [ ] `UPSTASH_REDIS_REST_URL`
- [ ] `UPSTASH_REDIS_REST_TOKEN`

#### Google OAuth
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

#### 邮件服务
- [ ] `RESEND_API_KEY`
- [ ] `FROM_EMAIL`

#### 分析和监控
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID`（Google Analytics）
- [ ] `NEXT_PUBLIC_SENTRY_DSN`（Sentry）

### 5. 数据库准备
- [ ] 数据库已创建
- [ ] 运行数据库迁移：`pnpm db:push` 或 `pnpm db:migrate`
- [ ] 测试数据库连接

### 6. 外部服务配置

#### Stripe
- [ ] Webhook 端点已配置：`https://your-domain.com/api/payments/webhook`
- [ ] Webhook 签名密钥已获取
- [ ] 产品和价格已在 Stripe 创建

#### Google OAuth（如果使用）
- [ ] OAuth 应用已创建
- [ ] 授权回调 URL 已配置：`https://your-domain.com/api/auth/callback/google`
- [ ] 客户端 ID 和密钥已获取

### 7. 安全检查
- [ ] 所有密钥都已更改（不使用默认值）
- [ ] `BETTER_AUTH_SECRET` 是随机生成的强密钥
- [ ] `.env` 文件不在 Git 仓库中
- [ ] 生产环境使用 HTTPS
- [ ] CORS 配置正确

### 8. 性能优化
- [ ] 启用 CDN（Coolify 自带或 Cloudflare）
- [ ] 配置 Redis 缓存（推荐）
- [ ] 图片优化已启用
- [ ] 启用压缩（Dockerfile 已配置）

### 9. 监控和日志
- [ ] 健康检查端点可访问：`/api/health`
- [ ] 错误追踪已配置（Sentry）
- [ ] 应用日志可在 Coolify 查看
- [ ] 设置告警通知（可选）

## 🚀 部署步骤

### 第一次部署

1. **在 Coolify 创建项目**
   - 选择 "New Resource" → "Application"
   - 连接 GitHub 仓库
   - 选择分支

2. **配置构建**
   - Build Pack: **Dockerfile**
   - Base Directory: `/`（默认）
   - Dockerfile Path: `Dockerfile`

3. **添加环境变量**
   - 在 "Environment" 标签页添加所有必需的环境变量
   - 可以批量导入（格式：`KEY=value`）

4. **配置域名**
   - 在 "Domains" 标签页添加域名
   - 启用自动 SSL

5. **首次部署**
   - 点击 "Deploy" 按钮
   - 监控构建日志
   - 等待部署完成

6. **验证部署**
   ```bash
   # 检查健康状态
   curl https://your-domain.com/api/health

   # 检查网站是否可访问
   curl https://your-domain.com
   ```

### 后续部署

1. **推送代码**
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. **自动部署**（如已启用 Auto Deploy）
   - Coolify 自动检测到推送并开始构建

3. **手动部署**（如未启用 Auto Deploy）
   - 在 Coolify 控制面板点击 "Redeploy"

## 🔍 部署后验证

### 1. 基础功能
- [ ] 网站可以访问
- [ ] 健康检查返回 200
- [ ] 静态资源加载正常
- [ ] API 端点工作正常

### 2. 数据库
- [ ] 数据库连接成功
- [ ] 数据可以正常读写
- [ ] 迁移已应用

### 3. 认证
- [ ] 用户可以注册
- [ ] 用户可以登录
- [ ] Google OAuth 工作正常（如已配置）

### 4. 支付
- [ ] Stripe checkout 可以打开
- [ ] Webhook 接收正常
- [ ] 订阅创建成功

### 5. AI 功能
- [ ] AI 对话工作正常
- [ ] 工具调用成功
- [ ] 流式响应正常

### 6. 性能
- [ ] 首屏加载时间 < 3秒
- [ ] API 响应时间 < 500ms
- [ ] 图片加载正常

## 🐛 常见问题排查

### 构建失败

**问题**: `husky: not found`
**解决**: 已修复，确保使用最新的代码

**问题**: `Cannot read properties of null`
**解决**: 已修复，确保使用最新的 MCP tools 路由代码

**问题**: `Environment variable missing`
**解决**: 这是正常的构建时警告，运行时会从 Coolify 注入

### 运行时错误

**问题**: 500 错误
**解决**: 检查 Coolify 日志，确认环境变量配置正确

**问题**: 数据库连接失败
**解决**:
1. 检查 `DATABASE_URL` 格式
2. 确认数据库网络可访问
3. 验证用户名和密码

**问题**: Stripe webhook 失败
**解决**:
1. 检查 webhook URL 配置
2. 验证 `STRIPE_WEBHOOK_SECRET`
3. 查看 Stripe Dashboard 的 webhook 日志

### 性能问题

**问题**: 加载慢
**解决**:
1. 启用 Redis 缓存
2. 配置 CDN
3. 优化数据库查询
4. 检查 bundle 大小

## 📊 监控指标

### 应用指标
- **可用性**: 目标 99.9%
- **响应时间**: < 500ms (p95)
- **错误率**: < 0.1%

### 资源使用
- **CPU**: < 80%
- **内存**: < 80%
- **磁盘**: < 80%

### 数据库
- **连接数**: 监控连接池
- **查询时间**: < 100ms (p95)
- **慢查询**: 记录 > 1s 的查询

## 🔄 回滚计划

如果部署出现严重问题：

1. **在 Coolify 回滚**
   - Deployments → 选择上一个成功的部署 → Redeploy

2. **检查日志**
   - 查看错误信息
   - 记录问题原因

3. **修复并重新部署**
   - 修复问题
   - 推送代码
   - 重新部署

## ✅ 部署完成

恭喜！你的应用已成功部署到 Coolify。

下一步：
- [ ] 配置监控和告警
- [ ] 设置定期备份
- [ ] 添加自定义域名
- [ ] 优化性能和 SEO
- [ ] 配置 CDN 加速
