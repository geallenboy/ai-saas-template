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
