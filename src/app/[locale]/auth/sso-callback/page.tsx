'use client'

import { AuthenticateWithRedirectCallback, useUser } from '@clerk/nextjs'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SSOCallback() {
  const [loadingState, setLoadingState] = useState<
    'authenticating' | 'redirecting' | 'error'
  >('authenticating')
  const [countdown, setCountdown] = useState(3)
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const locale = useLocale()

  // Monitor authentication status changes
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setLoadingState('redirecting')
      // Login successful, start countdown and redirect
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            router.replace(`/${locale}`)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
    // Ensure all code paths have a return value
    return () => {}
  }, [isLoaded, isSignedIn, router, locale])

  // Timeout handling
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loadingState === 'authenticating') {
        setLoadingState('error')
      }
    }, 15000) // 15 seconds timeout

    return () => clearTimeout(timeout)
  }, [loadingState])

  if (loadingState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 text-amber-500">
            <svg
              className="w-full h-full"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L1 21h22L12 2zm0 3.464L19.464 19H4.536L12 5.464zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            登录时间较长
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            请稍候或尝试刷新页面
          </p>
          <button
            onClick={() => router.push(`/${locale}/auth/sign-in`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回登录页面
          </button>
        </div>
      </div>
    )
  }

  if (loadingState === 'redirecting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 text-green-500">
            <svg
              className="w-full h-full"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            登录成功！
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {countdown} 秒后自动跳转到首页
          </p>
          <button
            onClick={() => router.replace(`/${locale}`)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            立即跳转
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-200 dark:border-blue-800"></div>
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          正在验证登录
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          请稍候，我们正在安全地完成您的登录...
        </p>
        <div className="flex items-center justify-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
          <span>验证中</span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
            <div
              className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
        </div>
      </div>
      <AuthenticateWithRedirectCallback
        afterSignInUrl={`/${locale}`}
        afterSignUpUrl={`/${locale}`}
      />
    </div>
  )
}
