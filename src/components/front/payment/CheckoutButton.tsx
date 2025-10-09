'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { trpc } from '@/server/client'

interface CheckoutButtonProps {
  planId: string
  planName: string
  monthlyPrice: number
  yearlyPrice: number
  currency: 'USD' | 'CNY'
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
  const [isYearly, setIsYearly] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const createCheckoutMutation =
    trpc.payments.createCheckoutSession.useMutation({
      onSuccess: data => {
        if (data.url) {
          // 跳转到Stripe结账页面
          window.location.href = data.url
        }
        setIsLoading(false)
      },
      onError: error => {
        console.error('创建结账会话失败:', error)
        setIsLoading(false)
        // 这里可以添加错误提示
      },
    })

  const handleUpgrade = async () => {
    setIsLoading(true)

    const durationType = isYearly ? 'yearly' : 'monthly'

    createCheckoutMutation.mutate({
      priceId: planId, // 假设planId就是priceId
      planName,
      paymentMethod: 'card',
      locale: 'zh',
      durationType,
    })
  }

  const currentPrice = isYearly ? yearlyPrice : monthlyPrice
  const currencySymbol = currency === 'USD' ? '$' : '¥'

  return (
    <div className={className}>
      {/* 计费周期切换 */}
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
          月付
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
          年付
          {isYearly && (
            <span className="ml-1 text-xs bg-green-500 text-white px-1 rounded">
              省{' '}
              {Math.round(
                ((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100
              )}
              %
            </span>
          )}
        </button>
      </div>

      {/* 价格显示 */}
      <div className="mb-4 text-center">
        <div className="text-3xl font-bold">
          {currencySymbol}
          {currentPrice}
        </div>
        <div className="text-sm text-muted-foreground">
          {isYearly ? '每年' : '每月'}
        </div>
        {isYearly && (
          <div className="text-xs text-green-600 mt-1">
            相当于每月 {currencySymbol}
            {(yearlyPrice / 12).toFixed(2)}
          </div>
        )}
      </div>

      {/* 购买按钮 */}
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
            处理中...
          </span>
        ) : (
          `升级到 ${planName}`
        )}
      </Button>

      <div className="mt-3 text-xs text-center text-muted-foreground">
        安全支付，随时可取消
      </div>
    </div>
  )
}
