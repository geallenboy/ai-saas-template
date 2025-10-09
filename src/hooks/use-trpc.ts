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
 * 用户管理hooks（管理员）
 */
export function useUsers(
  params?: Parameters<typeof trpc.users.getUsers.useQuery>[0]
) {
  const utils = trpc.useUtils()
  const usersQuery = trpc.users.getUsers.useQuery(params ?? {})
  const userStatsQuery = trpc.users.getUserStats.useQuery()

  const updateUser = trpc.users.updateUser.useMutation({
    onSuccess: () => {
      // 更新成功后刷新用户列表
      utils.users.getUsers.invalidate()
      utils.users.getUserStats.invalidate()
    },
  })

  const toggleUserStatus = trpc.users.toggleUserStatus.useMutation({
    onSuccess: () => {
      utils.users.getUsers.invalidate()
      utils.users.getUserStats.invalidate()
    },
  })

  return {
    usersQuery,
    userStatsQuery,
    updateUser,
    toggleUserStatus,
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
