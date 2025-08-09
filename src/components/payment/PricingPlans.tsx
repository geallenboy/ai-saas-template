'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'
import { useAuth, useUser } from '@clerk/nextjs'
import { motion, useMotionValue } from 'framer-motion'
import { Check, Crown, Loader2, Sparkles, Star, Zap } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface PricingSectionProps {
  className?: string
  showTitle?: boolean
  showDescription?: boolean
  showCurrentPlan?: boolean
}

export { PricingSection as PricingPlans }

export default function PricingSection({
  className = '',
  showTitle = true,
  showDescription = true,
  showCurrentPlan = false,
}: PricingSectionProps) {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const locale = useLocale()
  const t = useTranslations('pricing')

  // Status management
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  // New: Duration type selection status
  const [durationType, setDurationType] = useState<'monthly' | 'yearly'>(
    'monthly'
  )
  const [isYearly, setIsYearly] = useState(false)

  // 3D interaction effect
  const sectionRef = useRef<HTMLElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // tRPC hooks
  const { data: plans, isLoading: plansLoading } =
    trpc.payments.getMembershipPlans.useQuery()
  const { data: membershipStatus } =
    trpc.payments.getUserMembershipStatus.useQuery(undefined, {
      enabled: !!isSignedIn && !!user?.id,
    })

  const createCheckoutMutation =
    trpc.payments.createCheckoutSession.useMutation({
      onSuccess: data => {
        if (data.url) {
          window.location.href = data.url
        } else {
          toast.error(t('paymentLinkError'))
        }
        setCheckoutLoading(null)
      },
      onError: error => {
        console.error('Checkout error:', error)
        toast.error(error.message || t('checkoutSessionError'))
        setCheckoutLoading(null)
      },
    })

  // Switch duration type
  useEffect(() => {
    setDurationType(isYearly ? 'yearly' : 'monthly')
  }, [isYearly])

  // Calculate user membership information
  const hasActiveMembership = !!membershipStatus?.hasActiveMembership
  const currentPlan = membershipStatus?.currentPlan
  const remainingDays = membershipStatus?.remainingDays || 0
  const isExpired = membershipStatus?.isExpired ?? true

  // Mouse movement handling
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return

    const rect = sectionRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    mouseX.set((e.clientX - centerX) / rect.width)
    mouseY.set((e.clientY - centerY) / rect.height)
  }

  // Get price display based on term type and locale
  const getPlanPrice = (plan: any) => {
    if (locale === 'de') {
      // The German version shows Euros
      if (durationType === 'yearly') {
        const price = plan.priceEURYearly
        return price
          ? `${price}€`
          : `${(Number(plan.priceUSDEYearly) * 0.85).toFixed(0)}€`
      }
      const price = plan.priceEURMonthly
      return price
        ? `${price}€`
        : `${(Number(plan.priceUSDEMonthly) * 0.85).toFixed(0)}€`
    }
    // The English version shows US dollars
    if (durationType === 'yearly') {
      return `$${plan.priceUSDYearly || '0'}`
    }
    return `$${plan.priceUSDMonthly || '0'}`
  }

  // get duration text
  const getDurationText = () => {
    if (durationType === 'yearly') {
      return t('year')
    }
    return t('month')
  }

  // Calculate annual savings
  const getYearlySavings = (plan: any) => {
    if (locale === 'de') {
      if (!(plan.priceEURYearly && plan.priceEURMonthly)) {
        return null
      }

      const monthlyTotal = Number(plan.priceEURMonthly) * 12
      const yearlyPrice = Number(plan.priceEURYearly)
      const savings = monthlyTotal - yearlyPrice
      const savingsPercent = Math.round((savings / monthlyTotal) * 100)

      return { amount: savings, percent: savingsPercent }
    } else {
      if (!(plan.priceUSDYearly && plan.priceUSDMonthly)) {
        return null
      }

      const monthlyTotal = Number(plan.priceUSDMonthly) * 12
      const yearlyPrice = Number(plan.priceUSDYearly)
      const savings = monthlyTotal - yearlyPrice
      const savingsPercent = Math.round((savings / monthlyTotal) * 100)

      return { amount: savings, percent: savingsPercent }
    }
  }

  // Get plan icon
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

  // Check if it is the current plan
  const isCurrentPlan = (plan: any) => {
    return hasActiveMembership && currentPlan?.id === plan.id
  }

  // Check if it is a free plan
  const isFreePlan = (plan: any) => {
    return (
      plan.name.toLowerCase() === 'free' ||
      (Number(plan.priceUSDMonthly) === 0 && Number(plan.priceUSDYearly) === 0)
    )
  }

  // Handle membership purchase
  const handlePurchase = async (plan: any) => {
    if (!isSignedIn) {
      window.location.href = `/${locale}/auth/sign-in`
      return
    }

    if (isFreePlan(plan)) {
      toast.info(t('freePlanToast'))
      return
    }

    if (isCurrentPlan(plan)) {
      toast.info(t('alreadyMemberToast', { planName: plan.name }))
      return
    }

    // Select price ID based on term type and locale
    let priceId: string
    let paymentMethod: string

    if (locale === 'de') {
      // German version: Uses Euro price ID, supports credit card
      if (durationType === 'yearly') {
        priceId =
          plan.stripePriceIdEURYearly || plan.stripePriceIdUSDYearly || ''
      } else {
        priceId =
          plan.stripePriceIdEURMonthly || plan.stripePriceIdUSDMonthly || ''
      }
      paymentMethod = 'card' // The German version uses credit cards
    } else {
      // English version: Uses USD price ID, payment method is credit card
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
      toast.error(t('priceConfigError'))
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
        paymentMethod: paymentMethod as 'card',
        locale: locale as 'de' | 'en',
      })
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error('Checkout mutation failed:', error)
    }
  }

  // Get button text
  const getButtonText = (plan: any) => {
    if (isFreePlan(plan)) {
      return t('freeToUse')
    }

    if (isCurrentPlan(plan)) {
      return t('currentPlanButton', { days: remainingDays })
    }

    if (hasActiveMembership) {
      return t('renewMembership', {
        duration: durationType === 'yearly' ? t('year') : t('month'),
      })
    }

    return t('buyMembership', {
      duration: durationType === 'yearly' ? t('year') : t('month'),
    })
  }

  // Get button status
  const isButtonDisabled = (plan: any) => {
    return checkoutLoading === plan.name || (isCurrentPlan(plan) && !isExpired)
  }

  // Get valid plans - keep free plan for yearly payment
  const getValidPlans = () => {
    if (!plans) return []

    if (durationType === 'yearly') {
      return plans.filter(
        (plan: any) =>
          // Stay on the free plan or a plan with annual pricing
          isFreePlan(plan) ||
          (plan.priceUSDYearly && Number(plan.priceUSDYearly) > 0)
      )
    }
    return plans
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
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
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
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
        {/* title part */}
        {showTitle && (
          <motion.div
            className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('title')}
            </h2>
            {showDescription && (
              <>
                {/* Term Type Selector */}
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
                          {t('monthly')}
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
                          {t('yearly')}
                        </span>
                      </div>
                      {isYearly && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {t('save20')}
                        </Badge>
                      )}
                    </div>
                  </Card>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Pricing Cards */}
        {plansLoading ? (
          <LoadingSkeleton />
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
                  {/* Tag System - Avoid Overlap */}
                  {plan.isPopular && !isCurrentPlan(plan) && (
                    <div className="absolute top-0 right-4 transform -translate-y-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 shadow-lg">
                        <Star className="w-3 h-3 mr-1" />
                        {t('mostPopular')}
                      </Badge>
                    </div>
                  )}

                  {/* Annual payment savings tag */}
                  {isYearly &&
                    savings &&
                    savings.percent > 0 &&
                    !isCurrentPlan(plan) && (
                      <div className="absolute top-0 left-4 transform -translate-y-1/2 z-10">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 shadow-lg">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {t('savePercent', { percent: savings.percent })}
                        </Badge>
                      </div>
                    )}

                  {/* Current Plan Label - Highest Priority */}
                  {isCurrentPlan(plan) && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                      <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-1 shadow-lg">
                        <Check className="w-3 h-3 mr-1" />
                        {t('currentPlan')}
                      </Badge>
                    </div>
                  )}

                  <div className="p-8">
                    {/* plan head */}
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
                          {locale === 'de' ? plan.nameDe : plan.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {locale === 'de'
                            ? plan.descriptionDe
                            : plan.description}
                        </p>
                      </div>
                    </div>

                    {/* price */}
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
                          {t('membershipDays', {
                            days: durationType === 'yearly' ? 365 : 30,
                          })}
                        </p>
                      )}
                      {isYearly && savings && savings.percent > 0 && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          {t('saveAmount', {
                            currency: locale === 'de' ? '€' : '$',
                            amount: savings.amount.toFixed(2),
                          })}
                        </p>
                      )}
                    </div>

                    {/* Feature list */}
                    <ul className="space-y-3 mb-8">
                      {(
                        (locale === 'de' ? plan.featuresDe : plan.features) ||
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

                    {/* buy button */}
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
                          {t('creatingSession')}
                        </>
                      ) : (
                        getButtonText(plan)
                      )}
                    </Button>

                    {/* Additional information */}
                    {!isFreePlan(plan) && (
                      <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('paymentNote')}
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
