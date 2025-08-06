import { trpc } from '@/lib/trpc/client'

/**
 * Authentication-related hooks
 */
export function useAuth() {
  const utils = trpc.useUtils()
  const { data: user, isLoading } = trpc.auth.getCurrentUser.useQuery()
  const { data: authStatus } = trpc.auth.checkAuthStatus.useQuery()

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      // Update successful, refresh user data
      utils.auth.getCurrentUser.invalidate()
    },
  })

  const syncUser = trpc.auth.syncUserFromClerk.useMutation()

  return {
    user,
    isLoading,
    isAuthenticated: Boolean(authStatus?.isAuthenticated),
    isAdmin: Boolean(authStatus?.isAdmin),
    updateProfile,
    syncUser,
  }
}

/**
 * User management hooks (Admin)
 */
export function useUsers() {
  const utils = trpc.useUtils()

  const getUsersQuery = (
    params?: Parameters<typeof trpc.users.getUsers.useQuery>[0]
  ) => trpc.users.getUsers.useQuery(params || {})

  const getUserStats = () => trpc.users.getUserStats.useQuery()

  const updateUser = trpc.users.updateUser.useMutation({
    onSuccess: () => {
      // Update successful, refresh user list
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

  const deleteUser = trpc.users.deleteUser.useMutation({
    onSuccess: () => {
      utils.users.getUsers.invalidate()
      utils.users.getUserStats.invalidate()
    },
  })

  const bulkUpdateUsers = trpc.users.bulkUpdateUsers.useMutation({
    onSuccess: () => {
      utils.users.getUsers.invalidate()
      utils.users.getUserStats.invalidate()
    },
  })

  return {
    getUsersQuery,
    getUserStats,
    updateUser,
    toggleUserStatus,
    deleteUser,
    bulkUpdateUsers,
  }
}

/**
 * Payment and membership-related hooks
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
      // Update successful, refresh membership status
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
    // Convenient accessors
    hasActiveMembership: Boolean(membershipStatus?.hasActiveMembership),
    currentPlan: membershipStatus?.currentPlan,
    remainingDays: membershipStatus?.remainingDays || 0,
  }
}
