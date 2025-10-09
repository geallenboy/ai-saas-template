'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  authClient,
  type ExtendedUser,
  useBetterAuth,
} from '@/lib/auth/better-auth/client'
import { authStateManager } from '@/lib/auth/better-auth/state-manager'

/**
 * 增强的统一认证 Hook
 * 优化状态同步和用户体验
 */
export function useAuth() {
  const betterAuth = useBetterAuth()
  const [operationLoading, setOperationLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isStateStale, setIsStateStale] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 优化的状态同步检测 - 减少API调用
  useEffect(() => {
    let mounted = true

    const checkStateSync = async () => {
      // 只在必要时进行检查
      if (!betterAuth.isAuthenticated || betterAuth.isLoading || isStateStale) {
        return
      }

      try {
        // 使用缓存的会话检查，避免重复请求
        const session = await authStateManager.getSession()
        const serverHasUser = !!session.data?.user
        const clientHasUser = !!betterAuth.user

        if (serverHasUser !== clientHasUser && mounted) {
          setIsStateStale(true)
          console.warn('⚠️ 检测到认证状态不同步')
        }
      } catch (error) {
        console.error('状态同步检查失败:', error)
      }
    }

    // 移除初始检查，减少不必要的API调用
    // 只在页面可见且用户交互时进行检查
    const handleVisibilityChange = () => {
      if (
        !document.hidden &&
        betterAuth.isAuthenticated &&
        !betterAuth.isLoading
      ) {
        checkStateSync()
      }
    }

    // 监听页面可见性变化而不是定时检查
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 大幅增加检查间隔，减少资源消耗
    const interval = setInterval(checkStateSync, 300000) // 5分钟检查一次

    return () => {
      mounted = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [
    betterAuth.isAuthenticated,
    betterAuth.isLoading,
    betterAuth.user,
    isStateStale,
  ])

  // 强制同步状态的方法
  const syncAuthState = useCallback(async () => {
    try {
      // 清除缓存并强制获取最新状态
      authStateManager.clearCache()
      const session = await authStateManager.getSession(true)

      if (session.data?.user && !betterAuth.user) {
        // 如果服务端有用户但客户端没有，刷新页面
        console.log('🔄 同步认证状态，刷新页面...')
        window.location.reload()
        return true
      }
      setIsStateStale(false)
      return false
    } catch (error) {
      console.error('状态同步失败:', error)
      return false
    }
  }, [betterAuth.user])

  // 清除错误信息
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 设置错误信息
  const setAuthError = useCallback((error: string) => {
    setError(error)
  }, [])

  // 获取当前语言前缀
  const getCurrentLocale = useCallback(() => {
    return pathname.split('/')[1] || 'zh'
  }, [pathname])

  // 增强的邮箱登录
  const signIn = useCallback(
    async (
      email: string,
      password: string,
      options?: { rememberMe?: boolean; redirect?: boolean }
    ) => {
      // 登录前检查状态同步
      if (isStateStale) {
        await syncAuthState()
      }

      setOperationLoading(true)
      setError(null)

      try {
        const result = await authClient.signIn.email({
          email,
          password,
          rememberMe: options?.rememberMe,
        })

        if (result.data) {
          toast.success('登录成功')

          // 智能重定向逻辑
          if (options?.redirect !== false) {
            // 短暂延迟让状态更新
            setTimeout(() => {
              const locale = getCurrentLocale()
              router.push(`/${locale}/dashboard`)
            }, 300)
          }

          setOperationLoading(false)
          return { success: true }
        }

        const errorMsg = result.error?.message || '登录失败'
        setError(errorMsg)
        setOperationLoading(false)
        return { success: false, error: errorMsg }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '登录过程中发生错误'
        setError(errorMessage)
        setOperationLoading(false)
        return { success: false, error: errorMessage }
      }
    },
    [isStateStale, syncAuthState, getCurrentLocale, router]
  )

  // 邮箱注册
  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      setOperationLoading(true)
      setError(null)

      try {
        const result = await authClient.signUp.email({
          email,
          password,
          name: name || '',
        })

        if (result.data) {
          toast.success('注册成功')

          // 等待认证状态完全同步
          const syncSuccess = await authStateManager.waitForAuthSync()

          if (!syncSuccess) {
            console.warn('注册后状态同步超时，但注册成功')
          }

          setOperationLoading(false)
          return { success: true }
        }

        const errorMsg = result.error?.message || '注册失败'
        setError(errorMsg)
        setOperationLoading(false)
        return { success: false, error: errorMsg }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '注册过程中发生错误'
        setError(errorMessage)
        setOperationLoading(false)
        return { success: false, error: errorMessage }
      }
    },
    []
  )

  // 退出登录
  const signOut = useCallback(async () => {
    setOperationLoading(true)

    try {
      await authClient.signOut()
      toast.success('已退出登录')
      const locale = getCurrentLocale()
      router.push(`/${locale}/auth/login`)
      setOperationLoading(false)
    } catch (err) {
      console.error('Logout error:', err)
      const locale = getCurrentLocale()
      router.push(`/${locale}/auth/login`)
      setOperationLoading(false)
    }
  }, [router, getCurrentLocale])

  // Google 登录
  const signInWithGoogle = useCallback(
    async (callbackURL?: string) => {
      setOperationLoading(true)
      setError(null)

      try {
        const locale = getCurrentLocale()

        // 如果没有提供 callbackURL，使用默认的
        const finalCallbackURL =
          callbackURL ||
          `${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/auth/callback`

        console.log('🚀 启动 Google 登录:', {
          locale,
          callbackURL: finalCallbackURL,
        })

        await authClient.signIn.social({
          provider: 'google',
          callbackURL: finalCallbackURL,
        })

        // Google 登录会重定向，不需要手动处理成功状态
      } catch (err) {
        let errorMessage = 'Google登录失败'

        if (err instanceof Error) {
          console.error('❌ Google登录失败详情:', {
            message: err.message,
            stack: err.stack,
            name: err.name,
          })

          // 根据错误类型提供更友好的提示
          if (err.message.includes('ECONNREFUSED')) {
            errorMessage = '网络连接失败，请检查网络设置或稍后重试'
          } else if (err.message.includes('timeout')) {
            errorMessage = '连接超时，请稍后重试'
          } else if (err.message.includes('CORS')) {
            errorMessage = '跨域请求失败，请检查域名配置'
          } else {
            errorMessage = err.message
          }
        } else {
          console.error('❌ Google登录失败 (未知错误):', err)
        }

        setError(errorMessage)
        setOperationLoading(false)
        toast.error(errorMessage)
      }
    },
    [getCurrentLocale]
  )

  // 更新用户信息
  const updateUser = useCallback(
    async (data: { name?: string; image?: string }) => {
      setOperationLoading(true)
      setError(null)

      try {
        const result = await authClient.updateUser(data)

        if (result.data?.status) {
          toast.success('用户信息更新成功')
          setOperationLoading(false)
          return { success: true }
        }

        const errorMsg = result.error?.message || '更新用户信息失败'
        setError(errorMsg)
        setOperationLoading(false)
        return { success: false, error: errorMsg }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '更新用户信息时发生错误'
        setError(errorMessage)
        setOperationLoading(false)
        return { success: false, error: errorMessage }
      }
    },
    []
  )

  // 用户类型断言
  const user = betterAuth.user as ExtendedUser | null

  // 导出认证状态和方法
  return {
    // 状态 - 优化后的状态管理
    user,
    session: betterAuth.session,
    isAuthenticated: betterAuth.isAuthenticated,
    isLoading: betterAuth.isLoading || operationLoading,
    error: error || betterAuth.error?.message,
    isStateStale, // 新增：状态是否过时

    // 用户信息便捷访问
    isAdmin: user?.isAdmin ?? false,
    adminLevel: user?.adminLevel ?? 0,
    userId: user?.id || null,
    userEmail: user?.email || null,
    userName: user?.name || null,
    userImage: user?.image || null,

    // 方法
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateUser,
    clearError,
    setError: setAuthError,
    syncAuthState, // 新增：手动同步状态

    // 便捷方法
    getCurrentLocale,

    // 状态信息
    authStatus: {
      user: user,
      isAuthenticated: betterAuth.isAuthenticated,
      isLoading: betterAuth.isLoading || operationLoading,
      error: error || betterAuth.error?.message,
      isStateStale,
    },
  }
}

// 简化的刷新会话 hook
export const useRefreshSession = () => {
  return async () => {
    // 简单的页面刷新
    window.location.reload()
  }
}
