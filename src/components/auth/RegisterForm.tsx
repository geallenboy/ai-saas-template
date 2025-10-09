'use client'

import {
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/auth'
import { localizePath } from '@/lib/utils'

// 注册表单验证模式
const registerSchema = z.object({
  fullName: z.string().min(1, '请输入姓名').max(50, '姓名不能超过50个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(6, '密码至少需要6个字符')
    .max(100, '密码不能超过100个字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码需要包含大小写字母和数字'),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, '请同意服务条款和隐私政策'),
})

interface RegisterFormProps {
  redirectTo?: string
  showSignIn?: boolean
  className?: string
}

export function RegisterForm({
  redirectTo = '/dashboard',
  showSignIn = true,
  className,
}: RegisterFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    acceptTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [registerError, setRegisterError] = useState('')
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)

  const { signUp, signInWithGoogle, error, clearError } = useAuth()

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除字段错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    // 清除注册错误
    if (registerError) {
      setRegisterError('')
    }
    // 清除store错误
    if (error) {
      clearError()
    }
  }

  const validateForm = () => {
    try {
      registerSchema.parse(formData)
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

  const getPasswordStrength = (password: string) => {
    let strength = 0
    const checks = [
      password.length >= 6,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password),
    ]

    strength = checks.filter(Boolean).length

    if (strength < 2) return { level: 'weak', color: 'bg-red-500', text: '弱' }
    if (strength < 4)
      return { level: 'medium', color: 'bg-yellow-500', text: '中' }
    return { level: 'strong', color: 'bg-green-500', text: '强' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setRegisterError('')
    setIsEmailSubmitting(true)

    try {
      const result = await signUp(
        formData.email,
        formData.password,
        formData.fullName
      )

      if (result.success) {
        // 注册成功，延迟跳转确保状态同步
        console.log(
          'Registration successful, waiting for state sync before redirecting to:',
          redirectUrl
        )

        // 等待一小段时间让 Better Auth 状态完全更新
        await new Promise(resolve => setTimeout(resolve, 300))

        router.push(redirectUrl)
      } else {
        console.error('Registration failed:', result.error)
        setRegisterError(result.error || '注册失败，请稍后重试')
        setIsEmailSubmitting(false)
      }
    } catch (error: any) {
      console.error('Registration failed:', error)
      setRegisterError(error.message || '注册失败，请稍后重试')
      setIsEmailSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleSubmitting(true) // 显示加载状态
      setRegisterError('') // 清除错误

      // 添加一个小延迟让用户看到加载状态
      await new Promise(resolve => setTimeout(resolve, 300))

      await signInWithGoogle(redirectUrl)
    } catch (error: any) {
      console.error('Google login failed:', error)
      setRegisterError(error.message || 'Google登录失败')
      setIsGoogleSubmitting(false) // 出错时停止加载状态
    }
    // 注意：成功时不需要设置 setIsSubmitting(false)，因为页面即将跳转
  }

  return (
    <div className={`w-full space-y-6 sm:space-y-8 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* 全局错误提示 */}
        {(registerError || error) && (
          <Alert variant="destructive">
            <AlertDescription>{registerError || error}</AlertDescription>
          </Alert>
        )}

        {/* 姓名输入 */}
        <div className="space-y-1 sm:space-y-2">
          <Label
            htmlFor="fullName"
            className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            姓名
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Input
              id="fullName"
              type="text"
              placeholder="请输入您的姓名"
              value={formData.fullName}
              onChange={e => handleInputChange('fullName', e.target.value)}
              className={`pl-10 sm:pl-12 py-2.5 sm:py-3 text-base sm:text-lg border-2 focus:border-blue-500 transition-colors duration-300 ${
                errors.fullName ? 'border-red-500' : ''
              }`}
              disabled={isEmailSubmitting || isGoogleSubmitting}
              autoComplete="name"
            />
          </div>
          {errors.fullName && (
            <p className="text-sm text-red-500">{errors.fullName}</p>
          )}
        </div>

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
              autoComplete="new-password"
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

          {/* 密码强度指示器 */}
          {formData.password && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{
                      width: `${getPasswordStrength(formData.password).level === 'weak' ? 33 : getPasswordStrength(formData.password).level === 'medium' ? 66 : 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-600">
                  {passwordStrength.text}
                </span>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center space-x-1">
                  {formData.password.length >= 6 ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-gray-300" />
                  )}
                  <span>至少6个字符</span>
                </div>
                <div className="flex items-center space-x-1">
                  {/[a-z]/.test(formData.password) &&
                  /[A-Z]/.test(formData.password) ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-gray-300" />
                  )}
                  <span>包含大小写字母</span>
                </div>
                <div className="flex items-center space-x-1">
                  {/\d/.test(formData.password) ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-gray-300" />
                  )}
                  <span>包含数字</span>
                </div>
              </div>
            </div>
          )}

          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {/* 服务条款同意 */}
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="acceptTerms"
              checked={formData.acceptTerms}
              onCheckedChange={checked =>
                handleInputChange('acceptTerms', checked as boolean)
              }
              disabled={isEmailSubmitting || isGoogleSubmitting}
              className="mt-1"
            />
            <Label
              htmlFor="acceptTerms"
              className="text-xs sm:text-sm leading-5"
            >
              我已阅读并同意{' '}
              <Link
                href={localizePath(locale, '/terms')}
                className="text-blue-600 hover:text-blue-500 transition-colors duration-300"
              >
                服务条款
              </Link>{' '}
              和{' '}
              <Link
                href={localizePath(locale, '/privacy')}
                className="text-blue-600 hover:text-blue-500 transition-colors duration-300"
              >
                隐私政策
              </Link>
            </Label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-500">{errors.acceptTerms}</p>
          )}
        </div>

        {/* 注册按钮 */}
        <Button
          type="submit"
          className="w-full py-2.5 sm:py-3 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isEmailSubmitting || !formData.acceptTerms}
        >
          {isEmailSubmitting ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2 sm:mr-3" />
              创建中...
            </div>
          ) : (
            '创建账户'
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
              使用 Google 注册
            </div>
          )}
        </Button>
      </div>

      {/* 登录链接 */}
      {showSignIn && (
        <div className="text-center">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            已有账户？
            <Link
              href={`/${locale}/auth/login`}
              className="ml-2 text-blue-600 hover:text-blue-500 font-medium transition-colors duration-300"
            >
              立即登录
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
