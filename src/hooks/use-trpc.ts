import { trpc } from '@/server/client'

/**
 * 认证相关hooks
 */
export function useAuth() {
  const utils = trpc.useUtils()
  const { data: user, isLoading } = trpc.auth.getCurrentUser.useQuery()
  const { data: authStatus } = trpc.auth.checkAuthStatus.useQuery()

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      // 更新成功后刷新用户数据
      utils.auth.getCurrentUser.invalidate()
    },
  })

  return {
    user,
    isLoading,
    isAuthenticated: Boolean(authStatus?.isAuthenticated),
    isAdmin: Boolean(authStatus?.isAdmin),
    updateProfile,
  }
}

/**
 * 支付和会员相关hooks
 */
export function usePayments() {
  const utils = trpc.useUtils()

  const { data: membershipPlans, isLoading: plansLoading } =
    trpc.payments.getMembershipPlans.useQuery()

  const { data: membershipStatus, isLoading: statusLoading } =
    trpc.payments.getUserMembershipStatus.useQuery()

  const createCheckoutSession =
    trpc.payments.createCheckoutSession.useMutation()

  const activateMembership = trpc.payments.activateMembership.useMutation({
    onSuccess: () => {
      // 激活成功后刷新会员状态
      utils.payments.getUserMembershipStatus.invalidate()
    },
  })

  return {
    membershipPlans,
    plansLoading,
    membershipStatus,
    statusLoading,
    createCheckoutSession,
    activateMembership,
    // 便捷访问器
    hasActiveMembership: Boolean(membershipStatus?.hasActiveMembership),
    currentPlan: membershipStatus?.currentPlan,
    remainingDays: membershipStatus?.remainingDays || 0,
  }
}
