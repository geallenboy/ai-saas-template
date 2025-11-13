# 部署指南

## 使用 Coolify 部署（推荐）

### 1. 准备工作

确保你已经：
- ✅ 在 Coolify 中创建了项目
- ✅ 连接了 GitHub 仓库
- ✅ 准备好所有必需的环境变量

### 2. 配置 Coolify

#### 构建设置
- **Build Pack**: 选择 `Dockerfile`（不要使用 Nixpacks）
- **Dockerfile Path**: `Dockerfile`（默认）
- **Docker Build Context**: `.`（默认）

#### 环境变量配置

在 Coolify 的 Environment Variables 中添加以下变量：

##### 必需变量
```bash
# 应用配置
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# 数据库
DATABASE_URL=postgresql://user:password@host:5432/database

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Better Auth
BETTER_AUTH_SECRET=your-32-char-secret-key-here
BETTER_AUTH_URL=https://your-domain.com

# AI API (至少配置一个)
OPENAI_API_KEY=sk-xxx
# ANTHROPIC_API_KEY=sk-ant-xxx
# GOOGLE_GENERATIVE_AI_API_KEY=xxx
```

##### 可选变量
```bash
# Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com

# Email (Resend)
RESEND_API_KEY=re_xxx

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_PAYMENT_FEATURES=true
NEXT_PUBLIC_DEFAULT_LOCALE=zh
```

### 3. 部署流程

1. **推送代码到仓库**
   ```bash
   git add .
   git commit -m "Deploy to Coolify"
   git push
   ```

2. **在 Coolify 中部署**
   - 点击 "Deploy" 按钮
   - 或配置 Auto Deploy（推荐）

3. **监控构建日志**
   - 查看构建进度
   - 确认没有错误

4. **验证部署**
   - 访问你的域名
   - 检查功能是否正常

### 4. 构建优化

#### 环境变量处理
- ✅ 构建时会自动跳过环境变量验证（当 `DATABASE_URL` 不存在时）
- ✅ 运行时会从 Coolify 注入的环境变量读取配置

#### 构建时间优化
- 使用 Docker Layer Caching
- 在 Coolify 中启用 Build Cache

### 5. 故障排查

#### 构建失败
1. 检查 Dockerfile 语法
2. 确认 `output: 'standalone'` 配置存在于 `next.config.ts`
3. 查看详细的构建日志

#### 运行时错误
1. 检查环境变量是否正确配置
2. 确认数据库连接字符串正确
3. 查看应用日志

#### 常见问题

**Q: 构建时提示环境变量缺失**
A: 这是正常的。构建时会跳过验证，运行时会使用 Coolify 注入的环境变量。

**Q: 静态文件 404**
A: 确认 `output: 'standalone'` 已配置，并且 Dockerfile 正确复制了 `.next/static` 目录。

**Q: 数据库连接失败**
A: 检查 `DATABASE_URL` 格式和数据库网络配置。

---

## 使用 Docker Compose 本地部署

### 1. 创建 .env 文件
```bash
cp .env.example .env
# 编辑 .env 文件，填入真实的环境变量
```

### 2. 构建并运行
```bash
docker-compose up -d
```

### 3. 查看日志
```bash
docker-compose logs -f app
```

### 4. 停止服务
```bash
docker-compose down
```

---

## 使用纯 Docker 部署

### 1. 构建镜像
```bash
docker build -t ai-saas-template:latest .
```

### 2. 运行容器
```bash
docker run -d \
  --name ai-saas-app \
  -p 3000:3000 \
  --env-file .env \
  ai-saas-template:latest
```

### 3. 查看日志
```bash
docker logs -f ai-saas-app
```

### 4. 停止容器
```bash
docker stop ai-saas-app
docker rm ai-saas-app
```

---

## 性能优化建议

### 1. 启用缓存
- 配置 Redis（Upstash）用于缓存和限流
- 使用 CDN 加速静态资源

### 2. 数据库优化
- 使用连接池
- 定期备份数据库
- 配置合适的索引

### 3. 监控
- 配置 Sentry 错误追踪
- 使用 Google Analytics 分析流量
- 设置健康检查端点

### 4. 安全性
- ✅ 使用强密码和密钥
- ✅ 启用 HTTPS
- ✅ 定期更新依赖
- ✅ 配置 CORS 和 CSP

---

## 健康检查

应用提供了健康检查端点（需要实现）：

```bash
GET /api/health
```

响应：
```json
{
  "status": "ok",
  "timestamp": "2025-01-13T10:00:00Z"
}
```

---

## 回滚

如果部署出现问题，可以快速回滚：

### Coolify
1. 在 Deployments 页面找到之前的成功部署
2. 点击 "Redeploy"

### Docker
```bash
# 切换到之前的镜像版本
docker run -d \
  --name ai-saas-app \
  -p 3000:3000 \
  --env-file .env \
  ai-saas-template:previous-version
```

---

## 扩展性

### 水平扩展
- 使用 Coolify 的 Scale 功能
- 配置负载均衡器
- 确保应用是无状态的

### 垂直扩展
- 增加容器的 CPU 和内存限制
- 优化数据库查询
- 使用缓存减少计算

---

## 支持

如有问题，请：
1. 查看构建日志
2. 检查环境变量配置
3. 提交 Issue 到 GitHub 仓库
