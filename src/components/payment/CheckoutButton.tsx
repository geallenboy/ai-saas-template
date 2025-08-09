'use client'

import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface CheckoutButtonProps {
  planId: string
  planName: string
  monthlyPrice: number
  yearlyPrice: number
  currency: 'USD' | 'EUR'
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
}

export function CheckoutButton({
  planId,
  planName,
  monthlyPrice,
  yearlyPrice,
  currency,
  variant = 'default',
  className,
}: CheckoutButtonProps) {
  const t = useTranslations('payment')
  const [isYearly, setIsYearly] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const createCheckoutMutation =
    trpc.payments.createCheckoutSession.useMutation({
      onSuccess: data => {
        if (data.url) {
          // Jump to the Stripe checkout page
          window.location.href = data.url
        }
        setIsLoading(false)
      },
      onError: error => {
        console.error('Failed to create checkout session:', error)
        setIsLoading(false)
        // Here you can add error prompts
      },
    })

  const handleUpgrade = async () => {
    setIsLoading(true)

    const durationType = isYearly ? 'yearly' : 'monthly'

    createCheckoutMutation.mutate({
      priceId: planId, // Assume planId is priceId
      planName,
      paymentMethod: 'card',
      locale: 'de',
      durationType,
    })
  }

  const currentPrice = isYearly ? yearlyPrice : monthlyPrice
  const currencySymbol = currency === 'USD' ? '$' : '¥'

  return (
    <div className={className}>
      {/* Billing cycle switching */}
      <div className="mb-4 flex items-center justify-center space-x-4">
        <button
          type="button"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !isYearly
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          onClick={() => setIsYearly(false)}
        >
          {t('monthly')}
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isYearly
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          onClick={() => setIsYearly(true)}
        >
          {t('yearly')}
          {isYearly && (
            <span className="ml-1 text-xs bg-green-500 text-white px-1 rounded">
              {t('save')}{' '}
              {Math.round(
                ((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100
              )}
              %
            </span>
          )}
        </button>
      </div>

      {/* Price display */}
      <div className="mb-4 text-center">
        <div className="text-3xl font-bold">
          {currencySymbol}
          {currentPrice}
        </div>
        <div className="text-sm text-muted-foreground">
          {isYearly ? t('perYear') : t('perMonth')}
        </div>
        {isYearly && (
          <div className="text-xs text-green-600 mt-1">
            {t('equivalentTo')}
            {currencySymbol}
            {(yearlyPrice / 12).toFixed(2)}
          </div>
        )}
      </div>

      {/* buy button */}
      <Button
        variant={variant}
        className="w-full"
        size="lg"
        onClick={handleUpgrade}
        disabled={isLoading || createCheckoutMutation.isPending}
      >
        {isLoading || createCheckoutMutation.isPending ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {t('processing')}
          </span>
        ) : (
          t('upgradeTo', { planName })
        )}
      </Button>

      <div className="mt-3 text-xs text-center text-muted-foreground">
        {t('securePayment')}
      </div>
    </div>
  )
}
