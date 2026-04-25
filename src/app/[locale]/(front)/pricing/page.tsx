'use client'

import { Bot, Crown, Sparkles, Star, Zap } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { PricingPlans } from '@/components/front/payment'
import { localizePath } from '@/lib/utils'

/**
 * AI 使用配额说明 - 四个层级
 */
const AI_QUOTA_TIERS = {
  en: [
    {
      name: 'Free',
      icon: Star,
      tokens: '10,000',
      sessions: '10',
      features: [
        'Basic AI chat',
        '10 sessions/month',
        '10K tokens/month',
        'Community support',
      ],
    },
    {
      name: 'Basic',
      icon: Zap,
      tokens: '100,000',
      sessions: '100',
      features: [
        'All Free features',
        '100 sessions/month',
        '100K tokens/month',
        'Email support',
        'Export conversations',
      ],
    },
    {
      name: 'Professional',
      icon: Crown,
      tokens: '1,000,000',
      sessions: '1,000',
      features: [
        'All Basic features',
        '1,000 sessions/month',
        '1M tokens/month',
        'Priority support',
        'Multi-model access',
        'RAG document upload',
      ],
    },
    {
      name: 'Enterprise',
      icon: Sparkles,
      tokens: 'Unlimited',
      sessions: 'Unlimited',
      features: [
        'All Pro features',
        'Unlimited sessions',
        'Unlimited tokens',
        'Dedicated support',
        'Custom models',
        'Advanced analytics',
        'API access',
      ],
    },
  ],
  zh: [
    {
      name: '免费版',
      icon: Star,
      tokens: '10,000',
      sessions: '10',
      features: [
        '基础 AI 聊天',
        '每月 10 次会话',
        '每月 1 万 Token',
        '社区支持',
      ],
    },
    {
      name: '基础版',
      icon: Zap,
      tokens: '100,000',
      sessions: '100',
      features: [
        '包含免费版所有功能',
        '每月 100 次会话',
        '每月 10 万 Token',
        '邮件支持',
        '导出对话记录',
      ],
    },
    {
      name: '专业版',
      icon: Crown,
      tokens: '1,000,000',
      sessions: '1,000',
      features: [
        '包含基础版所有功能',
        '每月 1,000 次会话',
        '每月 100 万 Token',
        '优先支持',
        '多模型切换',
        'RAG 文档上传',
      ],
    },
    {
      name: '企业版',
      icon: Sparkles,
      tokens: '无限制',
      sessions: '无限制',
      features: [
        '包含专业版所有功能',
        '无限会话',
        '无限 Token',
        '专属支持',
        '自定义模型',
        '高级分析',
        'API 访问',
      ],
    },
  ],
}

export default function PricingPage() {
  const locale = useLocale()
  const tiers = locale === 'zh' ? AI_QUOTA_TIERS.zh : AI_QUOTA_TIERS.en

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* 页面标题 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {locale === 'zh' ? '选择您的计划' : 'Choose Your Plan'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {locale === 'zh'
              ? '我们提供灵活的定价方案，满足个人用户到企业客户的不同需求。所有计划都包含核心AI功能，随时可以升级。'
              : 'Flexible pricing plans for individuals and enterprises. All plans include core AI features with easy upgrades.'}
          </p>
        </div>

        {/* 定价计划组件 */}
        <PricingPlans />

        {/* AI 使用配额对比 */}
        <div className="max-w-6xl mx-auto mt-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Bot className="h-6 w-6 text-purple-600" />
              <h2 className="text-3xl font-bold">
                {locale === 'zh' ? 'AI 使用配额' : 'AI Usage Quotas'}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {locale === 'zh'
                ? '每个层级包含不同的 AI 功能限制和 Token 配额'
                : 'Each tier includes different AI feature limits and token quotas'}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => {
              const Icon = tier.icon
              return (
                <div
                  key={tier.name}
                  className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{tier.name}</h3>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {tier.tokens}
                      </span>{' '}
                      tokens/{locale === 'zh' ? '月' : 'mo'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {tier.sessions}
                      </span>{' '}
                      {locale === 'zh' ? '会话/月' : 'sessions/mo'}
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2"
                      >
                        <span className="text-green-500 mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>

        {/* FAQ部分 */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {locale === 'zh' ? '常见问题' : 'FAQ'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {locale === 'zh'
                ? '关于定价和服务的常见疑问解答'
                : 'Common questions about pricing and services'}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {locale === 'zh' ? '可以随时取消吗？' : 'Can I cancel anytime?'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {locale === 'zh'
                  ? '是的，您可以随时取消订阅。取消后您仍可使用服务直到当前计费周期结束。'
                  : 'Yes, you can cancel your subscription at any time. You will still have access until the end of your current billing period.'}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {locale === 'zh'
                  ? '支持哪些支付方式？'
                  : 'What payment methods are supported?'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {locale === 'zh'
                  ? '我们支持信用卡、借记卡和支付宝等多种支付方式，所有支付都通过Stripe安全处理。'
                  : 'We support credit cards, debit cards, and Alipay. All payments are securely processed through Stripe.'}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {locale === 'zh'
                  ? '可以升级或降级计划吗？'
                  : 'Can I upgrade or downgrade?'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {locale === 'zh'
                  ? '当然可以。您可以随时在账户设置中升级或降级您的计划，费用将按比例计算。'
                  : 'Of course. You can upgrade or downgrade your plan at any time in your account settings. Charges will be prorated.'}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {locale === 'zh'
                  ? '免费试用期多长？'
                  : 'How long is the free trial?'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {locale === 'zh'
                  ? '所有付费计划都提供14天免费试用期，试用期内您可以免费使用所有功能。'
                  : 'All paid plans come with a 14-day free trial. You can use all features for free during the trial period.'}
              </p>
            </div>
          </div>
        </div>

        {/* 联系支持 */}
        <div className="text-center mt-16 p-8 bg-white/50 dark:bg-white/5 rounded-2xl backdrop-blur-sm">
          <h3 className="text-2xl font-bold mb-4">
            {locale === 'zh' ? '还有疑问？' : 'Still have questions?'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {locale === 'zh'
              ? '我们的客服团队随时为您解答疑问'
              : 'Our support team is here to help'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={localizePath(locale, '/contact')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {locale === 'zh' ? '联系客服' : 'Contact Support'}
            </Link>
            <Link
              href={localizePath(locale, '/docs')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {locale === 'zh' ? '查看文档' : 'View Docs'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
