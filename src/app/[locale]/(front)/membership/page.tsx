'use client'

import { MembershipCenter } from '@/components/front/payment/MembershipCenter'

export default function MembershipPage() {
  // 中间件已经处理了认证检查，不需要 AuthGuard
  return (
    <div className="min-h-screen bg-background">
      <MembershipCenter />
    </div>
  )
}
