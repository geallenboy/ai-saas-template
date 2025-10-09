'use client'

import { motion, useMotionValue } from 'framer-motion'
import { Check, Crown, Loader2, Sparkles, Star, Zap } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/hooks/auth'
import { cn } from '@/lib/utils'
import { trpc } from '@/server/client'

interface PricingSectionProps {
  className?: string
  showTitle?: boolean
  showDescription?: boolean
}

export { PricingSection as PricingPlans }

function PricingLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, skeletonIndex) => (
                <div key={skeletonIndex} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function PricingSection({
  className = '',
  showTitle = true,
  showDescription = true,
}: PricingSectionProps) {
  const { user, isAuthenticated } = useAuth()
  const locale = useLocale()

  // 状态管理
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  // 新增：期限类型选择状态
  const [durationType, setDurationType] = useState<'monthly' | 'yearly'>(
    'monthly'
  )
  const [isYearly, setIsYearly] = useState(false)

  // 3D交互效果
  const sectionRef = useRef<HTMLElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // tRPC hooks
  const { data: plans, isLoading: plansLoading } =
    trpc.payments.getMembershipPlans.useQuery()
  const { data: membershipStatus } =
    trpc.payments.getUserMembershipStatus.useQuery(undefined, {
      enabled: !!isAuthenticated && !!user?.id,
    })

  const createCheckoutMutation =
    trpc.payments.createCheckoutSession.useMutation({
      onSuccess: data => {
        if (data.url) {
          window.location.href = data.url
        } else {
          toast.error(
            locale === 'zh'
              ? '支付链接生成失败，请重试'
              : 'Payment link generation failed, please try again'
          )
        }
        setCheckoutLoading(null)
      },
      onError: error => {
        console.error('Checkout error:', error)
        toast.error(
          error.message ||
            (locale === 'zh'
              ? '创建支付会话失败，请重试'
              : 'Failed to create checkout session, please try again')
        )
        setCheckoutLoading(null)
      },
    })

  // 切换期限类型
  useEffect(() => {
    setDurationType(isYearly ? 'yearly' : 'monthly')
  }, [isYearly])

  // 计算用户会员信息
  const hasActiveMembership = !!membershipStatus?.hasActiveMembership
  const currentPlan = membershipStatus?.currentPlan
  const remainingDays = membershipStatus?.remainingDays || 0
  const isExpired = membershipStatus?.isExpired ?? true

  // 鼠标移动处理
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return

    const rect = sectionRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    mouseX.set((e.clientX - centerX) / rect.width)
    mouseY.set((e.clientY - centerY) / rect.height)
  }

  // 根据期限类型和语言环境获取价格显示
  const getPlanPrice = (plan: any) => {
    if (locale === 'zh') {
      // 中文版本显示人民币
      if (durationType === 'yearly') {
        const price = plan.priceCNYYearly
        return price
          ? `¥${price}`
          : `¥${(Number(plan.priceUSDYearly) * 7.2).toFixed(0)}`
      }
      const price = plan.priceCNYMonthly
      return price
        ? `¥${price}`
        : `¥${(Number(plan.priceUSDMonthly) * 7.2).toFixed(0)}`
    }
    // 英文版本显示美元
    if (durationType === 'yearly') {
      return `$${plan.priceUSDYearly || '0'}`
    }
    return `$${plan.priceUSDMonthly || '0'}`
  }

  // 获取期限文本
  const getDurationText = () => {
    if (durationType === 'yearly') {
      return locale === 'zh' ? '年' : 'year'
    }
    return locale === 'zh' ? '月' : 'month'
  }

  // 计算年付节省金额
  const getYearlySavings = (plan: any) => {
    if (!(plan.priceUSDYearly && plan.priceUSDMonthly)) {
      return null
    }

    const monthlyTotal = Number(plan.priceUSDMonthly) * 12
    const yearlyPrice = Number(plan.priceUSDYearly)
    const savings = monthlyTotal - yearlyPrice
    const savingsPercent = Math.round((savings / monthlyTotal) * 100)

    return { amount: savings, percent: savingsPercent }
  }

  // 获取计划图标
  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Star className="h-6 w-6" />
      case 'professional':
      case 'pro':
        return <Zap className="h-6 w-6" />
      case 'enterprise':
        return <Crown className="h-6 w-6" />
      default:
        return <Sparkles className="h-6 w-6" />
    }
  }

  // 检查是否为当前使用的计划
  const isCurrentPlan = (plan: any) => {
    return hasActiveMembership && currentPlan?.id === plan.id
  }

  // 检查是否为免费计划
  const isFreePlan = (plan: any) => {
    return (
      plan.name.toLowerCase() === 'free' ||
      (Number(plan.priceUSDMonthly) === 0 && Number(plan.priceUSDYearly) === 0)
    )
  }

  // 处理会员购买
  const handlePurchase = async (plan: any) => {
    if (!isAuthenticated) {
      window.location.href = `/${locale}/auth/login`
      return
    }

    if (isFreePlan(plan)) {
      toast.info(
        locale === 'zh'
          ? '免费计划无需购买，注册即可使用'
          : 'Free plan does not need to be purchased, register to use'
      )
      return
    }

    if (isCurrentPlan(plan)) {
      toast.info(`您已经是${plan.nameZh || plan.name}会员`)
      return
    }

    // 根据期限类型和语言环境选择价格ID
    let priceId: string
    let paymentMethod: string

    if (locale === 'zh') {
      // 中文版本：使用人民币价格ID，支持支付宝和信用卡
      if (durationType === 'yearly') {
        priceId =
          plan.stripePriceIdCNYYearly || plan.stripePriceIdUSDYearly || ''
      } else {
        priceId =
          plan.stripePriceIdCNYMonthly || plan.stripePriceIdUSDMonthly || ''
      }
      paymentMethod = 'alipay' // 中文版本优先使用支付宝
    } else {
      // 英文版本：使用美元价格ID，支付方式为信用卡
      if (durationType === 'yearly') {
        priceId = plan.stripePriceIdUSDYearly || ''
      } else {
        priceId = plan.stripePriceIdUSDMonthly || ''
      }
      paymentMethod = 'card'
    }

    if (!priceId) {
      console.error('No price ID found for plan:', plan.name, {
        locale,
        durationType,
        paymentMethod,
      })
      toast.error(
        locale === 'zh'
          ? '价格配置错误，请联系客服'
          : 'Price configuration error, please contact customer service'
      )
      return
    }

    console.log('Creating checkout session for:', {
      planName: plan.name,
      priceId,
      durationType,
      paymentMethod,
      locale,
    })

    setCheckoutLoading(plan.name)

    try {
      await createCheckoutMutation.mutateAsync({
        priceId,
        planName: plan.name,
        durationType,
        paymentMethod: paymentMethod as 'card' | 'alipay',
        locale: locale as 'zh' | 'en',
      })
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error('Checkout mutation failed:', error)
    }
  }

  // 获取按钮文本
  const getButtonText = (plan: any) => {
    if (isFreePlan(plan)) {
      return locale === 'zh' ? '免费使用' : 'Free to use'
    }

    if (isCurrentPlan(plan)) {
      return locale === 'zh'
        ? `当前计划 (还有${remainingDays}天)`
        : `Current plan (remaining ${remainingDays} days)`
    }

    if (hasActiveMembership) {
      return locale === 'zh'
        ? `续费${durationType === 'yearly' ? '年' : '月'}度会员`
        : `Renew ${durationType === 'yearly' ? 'year' : 'month'} membership`
    }

    return locale === 'zh'
      ? `购买${durationType === 'yearly' ? '年' : '月'}度会员`
      : `Buy ${durationType === 'yearly' ? 'year' : 'month'} membership`
  }

  // 获取按钮状态
  const isButtonDisabled = (plan: any) => {
    return checkoutLoading === plan.name || (isCurrentPlan(plan) && !isExpired)
  }

  // 获取有效计划 - 年付时保留免费计划
  const getValidPlans = () => {
    if (!plans) return []

    if (durationType === 'yearly') {
      return plans.filter(
        (plan: any) =>
          // 保留免费计划或有年付价格的计划
          isFreePlan(plan) ||
          (plan.priceUSDYearly && Number(plan.priceUSDYearly) > 0)
      )
    }
    return plans
  }

  return (
    <motion.section
      ref={sectionRef}
      className={cn('py-20 px-4 relative overflow-hidden', className)}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-8xl mx-auto relative z-10">
        {/* 标题部分 */}
        {showTitle && (
          <motion.div
            className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {locale === 'zh' ? '选择适合您的计划' : 'Choose Your Plan'}
            </h2>
            {showDescription && (
              <>
                {/* 期限类型选择器 */}
                <div className="flex items-center justify-center mb-6">
                  <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'text-sm font-medium transition-colors',
                            !isYearly
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-500'
                          )}
                        >
                          {locale === 'zh' ? '月付' : 'Monthly'}
                        </span>
                        <Switch
                          checked={isYearly}
                          onCheckedChange={setIsYearly}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <span
                          className={cn(
                            'text-sm font-medium transition-colors',
                            isYearly
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-500'
                          )}
                        >
                          {locale === 'zh' ? '年付' : 'Yearly'}
                        </span>
                      </div>
                      {isYearly && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {locale === 'zh' ? '节省高达20%' : 'Save up to 20%'}
                        </Badge>
                      )}
                    </div>
                  </Card>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* 定价卡片 */}
        {plansLoading ? (
          <PricingLoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {getValidPlans().map((plan: any, index: number) => {
              const savings = isYearly ? getYearlySavings(plan) : null

              return (
                <motion.div
                  key={plan.id}
                  className={cn(
                    'relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300',
                    plan.isPopular && 'ring-2 ring-blue-500 scale-105',
                    isCurrentPlan(plan) &&
                      'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20'
                  )}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{
                    y: -8,
                    transition: { duration: 0.2 },
                  }}
                >
                  {/* 标签系统 - 避免重叠 */}
                  {plan.isPopular && !isCurrentPlan(plan) && (
                    <div className="absolute top-0 right-4 transform -translate-y-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 shadow-lg">
                        <Star className="w-3 h-3 mr-1" />
                        {locale === 'zh' ? '推荐' : 'Popular'}
                      </Badge>
                    </div>
                  )}

                  {/* 年付节省标签 */}
                  {isYearly &&
                    savings &&
                    savings.percent > 0 &&
                    !isCurrentPlan(plan) && (
                      <div className="absolute top-0 left-4 transform -translate-y-1/2 z-10">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 shadow-lg">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {locale === 'zh'
                            ? `节省${savings.percent}%`
                            : `Save ${savings.percent}%`}
                        </Badge>
                      </div>
                    )}

                  {/* 当前计划标签 - 优先级最高 */}
                  {isCurrentPlan(plan) && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                      <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-1 shadow-lg">
                        <Check className="w-3 h-3 mr-1" />
                        {locale === 'zh' ? '当前计划' : 'Current plan'}
                      </Badge>
                    </div>
                  )}

                  <div className="p-8">
                    {/* 计划头部 */}
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className={cn(
                          'p-3 rounded-xl',
                          plan.isPopular
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        )}
                      >
                        {getPlanIcon(plan.name)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {locale === 'zh' ? plan.nameZh : plan.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {locale === 'zh'
                            ? plan.descriptionZh
                            : plan.description}
                        </p>
                      </div>
                    </div>

                    {/* 价格 */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                          {getPlanPrice(plan)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          / {getDurationText()}
                        </span>
                      </div>
                      {!isFreePlan(plan) && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {durationType === 'yearly' ? '365天' : '30天'}{' '}
                          {locale === 'zh' ? '会员权限' : 'membership rights'}
                        </p>
                      )}
                      {isYearly && savings && savings.percent > 0 && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          {locale === 'zh' ? '相比月付节省' : 'Save'} $
                          {savings.amount.toFixed(2)}
                        </p>
                      )}
                    </div>

                    {/* 功能列表 */}
                    <ul className="space-y-3 mb-8">
                      {(
                        (locale === 'zh' ? plan.featuresZh : plan.features) ||
                        []
                      ).map((feature: string, featureIndex: number) => (
                        <li
                          key={featureIndex}
                          className="flex items-start gap-3"
                        >
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* 购买按钮 */}
                    <Button
                      className={cn(
                        'w-full h-12 font-semibold transition-all duration-200',
                        plan.isPopular
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
                          : isCurrentPlan(plan)
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600'
                      )}
                      onClick={() => handlePurchase(plan)}
                      disabled={isButtonDisabled(plan)}
                    >
                      {checkoutLoading === plan.name ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {locale === 'zh'
                            ? '创建支付会话...'
                            : 'Creating payment session...'}
                        </>
                      ) : (
                        getButtonText(plan)
                      )}
                    </Button>

                    {/* 额外信息 */}
                    {!isFreePlan(plan) && (
                      <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {locale === 'zh'
                            ? '支持人民币付款，信用卡和支付宝'
                            : 'Secure payment with Stripe'}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </motion.section>
  )
}
