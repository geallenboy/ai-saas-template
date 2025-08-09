'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface CouponFormProps {
  onCouponApplied?: (coupon: any) => void
}

export function CouponForm({ onCouponApplied }: CouponFormProps) {
  const t = useTranslations('payment.coupon')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleApply = async () => {
    if (!code.trim()) return

    setLoading(true)
    setError(null)

    try {
      // TODO: Implementing coupon validation logic
      // const result = await validateCoupon(code)
      console.log('Validating coupon:', code)

      // Simulate success
      const mockCoupon = {
        code,
        discountType: 'percentage' as const,
        discountValue: '10',
        description: '10% discount',
      }

      setAppliedCoupon(mockCoupon)
      onCouponApplied?.(mockCoupon)
    } catch (_error) {
      setError(t('invalidCoupon'))
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setAppliedCoupon(null)
    setCode('')
    onCouponApplied?.(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {appliedCoupon ? (
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="secondary">{appliedCoupon.code}</Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {appliedCoupon.description}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRemove}>
              {t('remove')}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder={t('placeholder')}
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleApply()}
              />
              <Button onClick={handleApply} disabled={loading || !code.trim()}>
                {loading ? t('applying') : t('apply')}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
