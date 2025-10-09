'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { PricingPlans } from '@/components/front/payment'
import { localizePath } from '@/lib/utils'

export default function PricingPage() {
  const locale = useLocale()
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* 页面标题 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            选择您的计划
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            我们提供灵活的定价方案，满足个人用户到企业客户的不同需求。所有计划都包含核心AI功能，随时可以升级。
          </p>
        </div>

        {/* 定价计划组件 */}
        <PricingPlans />

        {/* FAQ部分 */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">常见问题</h2>
            <p className="text-gray-600 dark:text-gray-300">
              关于定价和服务的常见疑问解答
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">可以随时取消吗？</h3>
              <p className="text-gray-600 dark:text-gray-300">
                是的，您可以随时取消订阅。取消后您仍可使用服务直到当前计费周期结束。
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">支持哪些支付方式？</h3>
              <p className="text-gray-600 dark:text-gray-300">
                我们支持信用卡、借记卡和支付宝等多种支付方式，所有支付都通过Stripe安全处理。
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">可以升级或降级计划吗？</h3>
              <p className="text-gray-600 dark:text-gray-300">
                当然可以。您可以随时在账户设置中升级或降级您的计划，费用将按比例计算。
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">免费试用期多长？</h3>
              <p className="text-gray-600 dark:text-gray-300">
                所有付费计划都提供14天免费试用期，试用期内您可以免费使用所有功能。
              </p>
            </div>
          </div>
        </div>

        {/* 联系支持 */}
        <div className="text-center mt-16 p-8 bg-white/50 dark:bg-white/5 rounded-2xl backdrop-blur-sm">
          <h3 className="text-2xl font-bold mb-4">还有疑问？</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            我们的客服团队随时为您解答疑问
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={localizePath(locale, '/contact')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              联系客服
            </Link>
            <Link
              href={localizePath(locale, '/docs')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              查看文档
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
