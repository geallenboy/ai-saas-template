'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useBetterAuth } from '@/lib/auth/better-auth/client'
import { authStateManager } from '@/lib/auth/better-auth/state-manager'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const betterAuth = useBetterAuth()
  const [processingStep, setProcessingStep] = useState('正在验证登录状态...')
  const [isProcessing, setIsProcessing] = useState(true)

  // 优化的状态检查，使用缓存减少API调用
  const checkAuthState = useCallback(async () => {
    try {
      // 首先检查Better Auth hooks的状态
      if (betterAuth.isAuthenticated && betterAuth.user) {
        console.log('✅ Better Auth hooks已确认登录状态')
        return { success: true, user: betterAuth.user }
      }

      // 使用缓存的会话检查，避免重复请求
      const session = await authStateManager.getSession()
      if (session.data?.user) {
        console.log('✅ 缓存会话检查确认登录状态')
        return { success: true, user: session.data.user }
      }

      return { success: false }
    } catch (error) {
      console.error('状态检查失败:', error)
      return { success: false }
    }
  }, [betterAuth.isAuthenticated, betterAuth.user])

  // 优化的重定向处理
  const handleSuccessfulAuth = useCallback(
    (user: any) => {
      const currentPath = window.location.pathname
      const locale = currentPath.split('/')[1] || 'zh'
      const redirectUrl = searchParams.get('redirect') || `/${locale}/dashboard`

      setProcessingStep('登录成功，正在跳转...')
      toast.success(`欢迎回来，${user.name || user.email}！`)

      // 使用较短的延迟，提升用户体验
      setTimeout(() => {
        // 先尝试使用router.push，如果状态同步有问题再回退到强制刷新
        if (betterAuth.isAuthenticated) {
          router.push(redirectUrl)
        } else {
          // 状态未同步时才使用强制刷新
          window.location.href = redirectUrl
        }
      }, 600)
    },
    [searchParams, router, betterAuth.isAuthenticated]
  )

  useEffect(() => {
    if (!isProcessing) return

    const handleCallback = async () => {
      try {
        console.log('🔄 开始处理OAuth回调...')
        setProcessingStep('正在获取用户信息...')

        // 等待Better Auth hooks初始化完成
        if (betterAuth.isLoading) {
          console.log('⏳ 等待Better Auth初始化...')
          return
        }

        // 检查认证状态
        const authResult = await checkAuthState()

        if (authResult.success && authResult.user) {
          setIsProcessing(false)
          handleSuccessfulAuth(authResult.user)
          return
        }

        // 如果还未认证，进行轮询检查
        let attempts = 0
        const maxAttempts = 12 // 减少最大尝试次数

        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500))

          const recheckResult = await checkAuthState()

          if (recheckResult.success && recheckResult.user) {
            setIsProcessing(false)
            handleSuccessfulAuth(recheckResult.user)
            return
          }

          attempts++
          console.log(`⏳ 等待登录状态同步... (${attempts}/${maxAttempts})`)
          setProcessingStep(`正在验证身份... (${attempts}/${maxAttempts})`)
        }

        // 超时处理
        console.log('❌ 登录验证超时')
        setIsProcessing(false)
        toast.error('登录验证超时，请重试')

        const currentPath = window.location.pathname
        const locale = currentPath.split('/')[1] || 'zh'
        router.push(`/${locale}/auth/login`)
      } catch (error) {
        console.error('❌ OAuth回调处理失败:', error)
        setIsProcessing(false)
        toast.error('登录过程中出现错误')

        const currentPath = window.location.pathname
        const locale = currentPath.split('/')[1] || 'zh'
        router.push(`/${locale}/auth/login`)
      }
    }

    // 延迟执行，确保页面完全加载
    const timer = setTimeout(handleCallback, 300)
    return () => clearTimeout(timer)
  }, [
    isProcessing,
    betterAuth.isLoading,
    checkAuthState,
    handleSuccessfulAuth,
    router,
  ])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500 mx-auto" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            正在完成登录...
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {processingStep}
          </p>
        </div>

        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <div
            className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
            style={{ animationDelay: '0.2s' }}
          />
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
            style={{ animationDelay: '0.4s' }}
          />
        </div>
      </div>
    </div>
  )
}
