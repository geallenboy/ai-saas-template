# 🚀 **AI SaaS Template**

**AI SaaS Template** 是一个开箱即用的 Next.js 模板，专为快速构建 AI 驱动的 SaaS 应用而设计。它集成了 AI 功能、用户认证、支付处理、数据管理和一键部署工具，帮助开发者高效启动和扩展项目，节省开发时间，快速进入生产环境。

## ✨ **功能特性**

### **AI 集成**

- **多种 AI 功能**：内置支持文本生成、图像处理、自然语言处理等，轻松扩展 AI 功能。
- **AI 模型支持**：集成了 OpenAI、Hugging Face 等主流 AI 模型，开发者可以无缝接入不同的 AI 服务。
- **易于定制**：通过简单的 API 调用即可快速集成新的 AI 模型和功能。

### **用户认证**

- **Google OAuth 一键登录**：简化用户注册和登录流程，提升用户体验。
- **Supabase 认证**：强大的用户认证、注册、密码重置等功能，内置安全管理。

### **支付处理**

- **集成 Stripe**：支持全球范围的支付功能，支持订阅服务和一次性支付。
- **快速实现商业化**：开箱即用的支付页面和 API，轻松接入商业化功能，支持订阅、支付和订单管理。

### **数据管理**

- **Supabase 数据管理**：强大的实时数据库、存储和认证功能，支持动态扩展数据结构。
- **数据可扩展性**：根据业务需求动态调整数据模型，适应不同规模的应用。

### **一键部署**

- **Vercel 和 Cloudflare 支持**：一键部署功能，自动化配置，减少部署错误。
- **零配置部署**：即使是新手开发者也能通过一键部署将项目上线到生产环境。

### **业务分析**

- **集成 Google Analytics 和 Search Console**：实时监控网站流量和用户行为，提供数据支持决策。
- **增长追踪工具**：帮助开发者优化用户留存、转化率及商业化路径。

### **AI 就绪基础设施**

- **AI 服务的内建支持**：预配置的 AI 集成功能，包括文本生成、图像处理等，开发者可以直接使用。
- **积分系统与 API 销售功能**：支持用户通过积分获取 AI 服务或购买 API 接口，为平台带来新的收入来源。

---

## 🛠️ **快速开始**

### 1. **克隆项目**

```bash
git clone https://github.com/geallenboy/ai-saas-template.git
cd ai-saas-template
```

### 2. **安装依赖**

```bash
npm install
# 或
yarn install
```

### 3. **配置环境变量**

复制 `.env.example` 文件并重命名为 `.env`，然后填写以下变量：

```env
# Supabase
SUPABASE_URL='' # change this to your supabase url
SUPABASE_ANON_KEY='' # change this to your supabase anon key
SUPABASE_SERVICE_ROLE_KEY='' # change this to your supabase service role key

# Replicate
REPLICATE_API_TOKEN='' # change this to your replicate api token
NEXT_PUBLIC_REPLICATE_USER_NAME='' # change this to your replicate username

# Use the following in the development environment
NGROK_HOST='' # change this to your ngrok host

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='' # change this to your stripe publishable key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE='' # change this to your stripe publishable live key
STRIPE_SECRET_KEY='' # change this to your stripe secret key
STRIPE_WEBHOOK_SECRET='' # change this to your stripe webhook secret

# Use the following in the production environment
NEXT_PUBLIC_SITE_URL='' # change this to your site url

# Resend
RESEND_API_KEY='' # change this to your resend api key
```

### 4. **运行开发服务器**

```bash
npm run dev
# 或
yarn dev
```

### 5. **部署到生产环境**

- **Vercel**: 使用 Vercel CLI 一键部署：
  ```bash
  vercel deploy
  ```
- **Cloudflare**: 配置 Cloudflare Pages 并上传项目。

---

---

## 🌍 **国际化支持**

- **多语言支持**：内置 `next-intl` 国际化框架，支持全球用户。
- **动态语言切换**：让用户可以自由选择界面语言，提升国际用户体验。

---

## 🔒 **安全性**

- **Supabase 认证**：内建安全认证与权限管理，确保应用的用户数据和行为的安全性。
- **SSL/TLS 加密**：所有数据传输经过加密处理，保障用户数据的安全性。

---

## 📈 **业务增长**

- **集成 Google Analytics 和 Search Console**：提供强大的数据分析和流量监控功能。
- **用户增长跟踪**：提供业务增长分析工具，帮助开发者了解用户行为和优化产品设计。

---

## 📄 **许可证**

本项目基于 [MIT 许可证](LICENSE) 开源，欢迎自由使用和贡献。

---

## 🙌 **贡献指南**

欢迎提交 Issue 和 Pull Request！请确保遵循以下步骤：

1. Fork 项目并克隆到本地。
2. 创建新分支：`git checkout -b feature/your-feature-name`。
3. 提交更改：`git commit -m "Add your feature"`。
4. 推送到远程分支：`git push origin feature/your-feature-name`。
5. 提交 Pull Request。

---

## 📞 **联系我**

如有问题或建议，请通过以下方式联系我们：

- **Email**: gejialun88@gmail.com
- **weixin**: wxgegarron
- **GitHub Issues**: [提交 Issue](https://github.com/geallenboy/ai-saas-template/issues)

---

## 🌟 **特别感谢**

- [Next.js](https://nextjs.org) - 提供强大的 React 框架，构建现代 Web 应用。
- [Supabase](https://supabase.io) - 提供实时数据库和认证服务，简化后端管理。
- [Stripe](https://stripe.com) - 提供强大的支付解决方案，帮助你实现支付系统。
- [OpenAI](https://openai.com) - 提供顶尖的 AI 模型，帮助你打造智能化应用。

---

🚀 **立即开始**，使用 AI SaaS Template 快速构建你的下一个 AI 驱动应用，节省开发时间，加速产品上线！

---
