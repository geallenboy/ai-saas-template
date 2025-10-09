'use client'

import { Suspense } from 'react'
import {
  SystemConfigManager,
  SystemSettingsForm,
} from '@/components/admin/system'
import { AdminGuardClient } from '@/components/auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const generalFields = [
  {
    key: 'site.name',
    label: '网站名称',
    description: '展示在导航栏、标题等位置的品牌名称。',
    defaultValue: 'AI SaaS Platform',
  },
  {
    key: 'site.description',
    label: '网站描述',
    description: '用于 SEO 与社交分享的简短描述。',
    type: 'text' as const,
    placeholder: '下一代 AI SaaS 平台，帮助团队快速落地 AI 能力',
  },
  {
    key: 'site.url',
    label: '主站域名',
    description: '用于生成站内链接和回调地址，需填写完整域名（含协议）。',
    placeholder: 'https://example.com',
  },
  {
    key: 'site.supportEmail',
    label: '客服邮箱',
    description: '用户反馈、系统通知默认使用该邮箱。',
    placeholder: 'support@example.com',
  },
  {
    key: 'branding.primaryColor',
    label: '主题主色调',
    description: '自定义产品的品牌主色（十六进制）。',
    placeholder: '#3b82f6',
  },
]

const paymentFields = [
  {
    key: 'stripe.publishableKey',
    label: 'Stripe Publishable Key',
    description: '用于前端请求的公开密钥。',
    secret: true,
  },
  {
    key: 'stripe.secretKey',
    label: 'Stripe Secret Key',
    description: '用于服务器端调用 Stripe API 的私钥。',
    secret: true,
  },
  {
    key: 'stripe.webhookSecret',
    label: 'Stripe Webhook Secret',
    description:
      '校验 Stripe Webhook 请求合法性，请与 Stripe 仪表盘配置保持一致。',
    secret: true,
  },
  {
    key: 'billing.defaultCurrency',
    label: '默认货币',
    description: '订阅价格、订单金额的默认货币单位。',
    defaultValue: 'USD',
  },
  {
    key: 'billing.taxRate',
    label: '默认税率(%)',
    description: '用于估算订单税费，可设置为 0 表示不含税。',
    type: 'number' as const,
    defaultValue: 0,
  },
]

const aiFields = [
  {
    key: 'ai.provider',
    label: 'AI 服务提供商',
    description: '当前使用的 AI 服务商标识（如 openai、azure-openai）。',
    defaultValue: 'openai',
  },
  {
    key: 'ai.apiKey',
    label: 'AI API Key',
    description: '调用 AI 模型的密钥，注意保管。',
    secret: true,
  },
  {
    key: 'ai.model',
    label: '默认模型',
    description: '系统默认使用的模型名称，例如 gpt-4o-mini。',
    defaultValue: 'gpt-4o-mini',
  },
  {
    key: 'ai.temperature',
    label: '回复创意度',
    description: '范围 0-1，数值越大回答越发散。',
    type: 'number' as const,
    defaultValue: 0.7,
  },
  {
    key: 'ai.enableStreaming',
    label: '启用流式输出',
    description: '开启后，AI 回复将直接流式推送给前端。',
    type: 'boolean' as const,
    defaultValue: true,
  },
]

const notificationFields = [
  {
    key: 'smtp.host',
    label: 'SMTP Host',
    description: '邮件服务器地址，例如 smtp.mailtrap.io。',
    defaultValue: 'smtp.mailtrap.io',
  },
  {
    key: 'smtp.port',
    label: 'SMTP Port',
    description: '邮件服务器端口，常用 465 / 587。',
    type: 'number' as const,
    defaultValue: 587,
  },
  {
    key: 'smtp.user',
    label: 'SMTP 用户名',
    description: '登录邮件服务的用户名。',
    secret: true,
  },
  {
    key: 'smtp.pass',
    label: 'SMTP 密码',
    description: '登录邮件服务的密码或授权码。',
    secret: true,
  },
  {
    key: 'notifications.email.enabled',
    label: '启用邮件通知',
    description: '控制系统邮件推送开关。',
    type: 'boolean' as const,
    defaultValue: true,
  },
]

const securityFields = [
  {
    key: 'security.allowRegistration',
    label: '允许用户注册',
    description: '关闭后仅管理员可以邀请新用户。',
    type: 'boolean' as const,
    defaultValue: true,
  },
  {
    key: 'security.maxLoginAttempts',
    label: '最大登录尝试次数',
    description: '连续失败达到阈值后将触发风控。',
    type: 'number' as const,
    defaultValue: 5,
  },
  {
    key: 'security.session.maxAge',
    label: '会话有效期 (秒)',
    description: '用户登录后保持会话的最长时长。',
    type: 'number' as const,
    defaultValue: 60 * 60 * 24 * 7,
  },
  {
    key: 'security.enableTwoFactor',
    label: '启用双因素认证',
    description: '启用后管理员可强制用户使用 2FA。',
    type: 'boolean' as const,
    defaultValue: false,
  },
]

const featureFields = [
  {
    key: 'features.blog',
    label: '博客模块',
    description: '控制博客内容是否对外展示。',
    type: 'boolean' as const,
    defaultValue: true,
  },
  {
    key: 'features.docs',
    label: '文档中心',
    description: '关闭后 Docs 标签将对用户隐藏。',
    type: 'boolean' as const,
    defaultValue: true,
  },
  {
    key: 'features.aiAssistant',
    label: 'AI 助手',
    description: '控制 AI 助手聊天/提示功能。',
    type: 'boolean' as const,
    defaultValue: true,
  },
  {
    key: 'features.analyticsDashboard',
    label: '数据分析面板',
    description: '用于内部统计的实验性功能。',
    type: 'boolean' as const,
    defaultValue: false,
  },
  {
    key: 'features.betaMode',
    label: 'Beta 模式',
    description: '开启后可向部分用户开放测试功能。',
    type: 'boolean' as const,
    defaultValue: false,
  },
]

function AdminSettingsContent() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">系统设置</h1>
        <p className="text-muted-foreground">管理系统配置和参数</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">基础设置</TabsTrigger>
          <TabsTrigger value="payment">支付配置</TabsTrigger>
          <TabsTrigger value="ai">AI配置</TabsTrigger>
          <TabsTrigger value="notification">通知设置</TabsTrigger>
          <TabsTrigger value="security">安全配置</TabsTrigger>
          <TabsTrigger value="feature">功能开关</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <SystemSettingsForm
            category="general"
            title="基础配置"
            description="管理品牌信息、站点基础设置。"
            fields={generalFields}
          />
          <Card>
            <CardHeader>
              <CardTitle>高级配置</CardTitle>
              <CardDescription>
                直接管理 General 分类下的所有原始配置项。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ConfigSkeleton />}>
                <SystemConfigManager category="general" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <SystemSettingsForm
            category="payment"
            title="支付配置"
            description="Stripe 等支付渠道所需的关键参数。"
            fields={paymentFields}
          />
          <Card>
            <CardHeader>
              <CardTitle>高级配置</CardTitle>
              <CardDescription>管理 Payment 分类下全部配置。</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ConfigSkeleton />}>
                <SystemConfigManager category="payment" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <SystemSettingsForm
            category="ai"
            title="AI 配置"
            description="统一管理 AI 服务商、模型与专用密钥。"
            fields={aiFields}
          />
          <Card>
            <CardHeader>
              <CardTitle>高级配置</CardTitle>
              <CardDescription>管理 AI 分类的高级参数。 </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ConfigSkeleton />}>
                <SystemConfigManager category="ai" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notification" className="space-y-6">
          <SystemSettingsForm
            category="notification"
            title="通知设置"
            description="配置邮件通知、SMTP 服务等渠道参数。"
            fields={notificationFields}
          />
          <Card>
            <CardHeader>
              <CardTitle>高级配置</CardTitle>
              <CardDescription>
                管理 Notification 分类下所有配置项。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ConfigSkeleton />}>
                <SystemConfigManager category="notification" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SystemSettingsForm
            category="security"
            title="安全配置"
            description="灵活设置注册策略、会话安全与风控策略。"
            fields={securityFields}
          />
          <Card>
            <CardHeader>
              <CardTitle>高级配置</CardTitle>
              <CardDescription>
                管理 Security 分类的全部配置项。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ConfigSkeleton />}>
                <SystemConfigManager category="security" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feature" className="space-y-6">
          <SystemSettingsForm
            category="feature"
            title="功能开关"
            description="快速控制常用功能模块是否对外开放。"
            fields={featureFields}
          />
          <Card>
            <CardHeader>
              <CardTitle>高级配置</CardTitle>
              <CardDescription>管理 Feature 分类下的详细配置。</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ConfigSkeleton />}>
                <SystemConfigManager category="feature" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ConfigSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="border-t pt-3">
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminSettingsPage() {
  return (
    <AdminGuardClient>
      <AdminSettingsContent />
    </AdminGuardClient>
  )
}
