'use client'

import { useAuth } from '@/hooks/auth'
import { trpc } from '@/server/client'

/**
 * 会员状态hook，带性能优化
 * 替代原有的useUserMembership hook
 */
export function useUserMembership(userId?: string) {
  const { user, isAuthenticated } = useAuth()

  const {
    data: membershipStatus,
    isLoading,
    error,
  } = trpc.payments.getUserMembershipStatus.useQuery(
    // 当userId为空时，使用空对象而不是undefined，这样tRPC会使用当前认证的用户
    userId ? { userId } : {},
    {
      // 性能优化配置
      enabled: isAuthenticated && !!user, // 只有在用户认证且存在时才启用查询
      staleTime: 5 * 60 * 1000, // 5分钟内数据视为新鲜，避免频繁查询
      gcTime: 10 * 60 * 1000, // 10分钟垃圾回收时间
      refetchOnWindowFocus: false, // 窗口聚焦时不自动刷新
      refetchOnMount: false, // 组件挂载时不自动刷新（如果有缓存）
      retry: (failureCount, error) => {
        // 如果是认证错误，不重试
        if (error?.data?.code === 'UNAUTHORIZED') {
          console.warn('use-membership: UNAUTHORIZED error, not retrying')
          return false
        }
        // 网络错误或服务器错误，最多重试2次
        if (failureCount < 2) {
          console.log(
            `use-membership: Retrying after failure ${failureCount + 1}`
          )
          return true
        }
        return false
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // 指数退避，最大30秒
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
    error, // 暴露错误信息用于调试
  }
}
