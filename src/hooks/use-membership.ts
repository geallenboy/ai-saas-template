'use client'

import { trpc } from '@/lib/trpc/client'

/**
 * Member status hook with performance optimization
 * Replace the original useUserMembership hook
 */
export function useUserMembership(userId?: string) {
  const { data: membershipStatus, isLoading } =
    trpc.payments.getUserMembershipStatus.useQuery(
      userId ? { userId } : undefined,
      {
        // Performance optimization configuration
        enabled: !!userId, // Only query if userId exists
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes to avoid frequent queries
        gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time
        refetchOnWindowFocus: false, // Do not refetch on window focus
        refetchOnMount: false, // Do not refetch on mount (if cached)
        retry: 1, // Retry failed requests once
      }
    )

  return {
    hasActiveMembership: Boolean(membershipStatus?.hasActiveMembership),
    currentPlan: membershipStatus?.currentPlan || null,
    membershipStatus,
    isLoading,
    remainingDays: membershipStatus?.remainingDays || 0,
    nextExpiryDate: membershipStatus?.nextExpiryDate,
    usage: membershipStatus?.usage,
  }
}
