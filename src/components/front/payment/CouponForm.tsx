'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface CouponFormProps {
  onCouponApplied?: (coupon: any) => void
}

export function CouponForm({ onCouponApplied }: CouponFormProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleApply = async () => {
    if (!code.trim()) return

    setLoading(true)
    setError(null)

    try {
      // TODO: 实现优惠券验证逻辑
      // const result = await validateCoupon(code)
      console.log('验证优惠券:', code)

      // 模拟成功
      const mockCoupon = {
        code,
        discountType: 'percentage' as const,
        discountValue: '10',
        description: '10% 折扣',
      }

      setAppliedCoupon(mockCoupon)
      onCouponApplied?.(mockCoupon)
    } catch (_error) {
      setError('优惠券无效或已过期')
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
        <CardTitle>优惠券</CardTitle>
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
              移除
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="输入优惠券代码"
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleApply()}
              />
              <Button onClick={handleApply} disabled={loading || !code.trim()}>
                {loading ? '验证中...' : '应用'}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
