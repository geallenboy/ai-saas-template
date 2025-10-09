'use client'

import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/auth'

// 登录表单验证模式
const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

interface LoginFormProps {
  redirectTo?: string
  showSignUp?: boolean
  className?: string
}

export function LoginForm({
  redirectTo = '/dashboard',
  showSignUp = true,
  className,
}: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loginError, setLoginError] = useState('')
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)

  const { signIn, signInWithGoogle, error, clearError } = useAuth()

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // 获取当前语言前缀
  const locale = pathname.split('/')[1] || 'zh'

  // 从URL参数中获取重定向地址，确保包含语言前缀
  const rawRedirectUrl = searchParams.get('redirect_url') || redirectTo
  const redirectUrl =
    rawRedirectUrl.startsWith('/') && !rawRedirectUrl.startsWith(`/${locale}`)
      ? `/${locale}${rawRedirectUrl}`
      : rawRedirectUrl

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除字段错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    // 清除登录错误
    if (loginError) {
      setLoginError('')
    }
    // 清除全局错误
    if (error) {
      clearError()
    }
  }

  const validateForm = () => {
    try {
      loginSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoginError('')
    setIsEmailSubmitting(true)

    const result = await signIn(formData.email, formData.password, {
      rememberMe,
    })

    if (result.success) {
      // 登录成功，直接跳转
      console.log('Login successful, redirecting to:', redirectUrl)
      router.push(redirectUrl)
    } else {
      console.error('Login failed:', result.error)
      setLoginError(result.error || '登录失败，请稍后重试')
    }

    setIsEmailSubmitting(false)
  }

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleSubmitting(true)
      setLoginError('')

      // 添加小延迟让用户看到加载状态
      await new Promise(resolve => setTimeout(resolve, 300))

      // 构建回调 URL
      const baseUrl =
        typeof window !== 'undefined' ? window.location.origin : ''
      const callbackURL =
        redirectUrl && redirectUrl !== `/${locale}`
          ? `${baseUrl}/${locale}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`
          : `${baseUrl}/${locale}/auth/callback`

      // 使用正确的回调 URL 调用 Google 登录
      await signInWithGoogle(callbackURL)
    } catch (error: any) {
      console.error('Google login failed:', error)
      setLoginError(error.message || 'Google登录失败')
      setIsGoogleSubmitting(false)
    }
  }

  return (
    <div className={`w-full space-y-6 sm:space-y-8 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* 全局错误提示 */}
        {(loginError || error) && (
          <Alert variant="destructive">
            <AlertDescription>{loginError || error}</AlertDescription>
          </Alert>
        )}

        {/* 邮箱输入 */}
        <div className="space-y-1 sm:space-y-2">
          <Label
            htmlFor="email"
            className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            邮箱地址
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="请输入您的邮箱"
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              className={`pl-10 sm:pl-12 py-2.5 sm:py-3 text-base sm:text-lg border-2 focus:border-blue-500 transition-colors duration-300 ${
                errors.email ? 'border-red-500' : ''
              }`}
              disabled={isEmailSubmitting || isGoogleSubmitting}
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* 密码输入 */}
        <div className="space-y-1 sm:space-y-2">
          <Label
            htmlFor="password"
            className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            密码
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入您的密码"
              value={formData.password}
              onChange={e => handleInputChange('password', e.target.value)}
              className={`pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-base sm:text-lg border-2 focus:border-blue-500 transition-colors duration-300 ${
                errors.password ? 'border-red-500' : ''
              }`}
              disabled={isEmailSubmitting || isGoogleSubmitting}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
              disabled={isEmailSubmitting || isGoogleSubmitting}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {/* 记住我和忘记密码 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isEmailSubmitting || isGoogleSubmitting}
            />
            <span className="ml-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              记住我 30 天
            </span>
          </label>
          {/* <Link
            href={`/${locale}/auth/forgot-password`}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-500 transition-colors duration-300"
          >
            忘记密码？
          </Link> */}
        </div>

        {/* 登录按钮 */}
        <Button
          type="submit"
          className="w-full py-2.5 sm:py-3 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isEmailSubmitting}
        >
          {isEmailSubmitting ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2 sm:mr-3" />
              登录中...
            </div>
          ) : (
            '登录'
          )}
        </Button>
      </form>

      {/* Google 登录 */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
              或
            </span>
          </div>
        </div>

        <Button
          onClick={handleGoogleLogin}
          className="w-full"
          variant="outline"
          disabled={isGoogleSubmitting}
        >
          {isGoogleSubmitting ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="animate-pulse">正在跳转到 Google...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              使用 Google 登录
            </div>
          )}
        </Button>
      </div>

      {/* 注册链接 */}
      {showSignUp && (
        <div className="text-center">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            还没有账户？
            <Link
              href={`/${locale}/auth/register`}
              className="ml-2 text-blue-600 hover:text-blue-500 font-medium transition-colors duration-300"
            >
              免费注册
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
