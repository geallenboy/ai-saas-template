'use client'

import { CheckCircle, Loader2, Mail, XCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth/better-auth/client'

type VerificationStatus = 'pending' | 'verifying' | 'success' | 'error'

export default function VerifyEmailPage() {
    const [status, setStatus] = useState<VerificationStatus>('pending')
    const [errorMessage, setErrorMessage] = useState('')
    const [isResending, setIsResending] = useState(false)

    const pathname = usePathname()
    const searchParams = useSearchParams()
    const locale = pathname.split('/')[1] || 'zh'

    // Better Auth 会在验证链接中附带 token 参数
    const token = searchParams.get('token')

    const verifyEmail = useCallback(async () => {
        if (!token) return

        setStatus('verifying')

        try {
            // Better Auth 的邮箱验证通过 API 端点自动处理
            // 当用户点击验证链接时，Better Auth 会自动验证 token
            // 这里我们调用 Better Auth 的验证端点
            const response = await fetch(
                `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
                { method: 'GET' }
            )

            if (response.ok) {
                setStatus('success')
                toast.success(
                    locale === 'zh' ? '邮箱验证成功！' : 'Email verified successfully!'
                )
            } else {
                setStatus('error')
                setErrorMessage(
                    locale === 'zh'
                        ? '验证链接无效或已过期'
                        : 'Verification link is invalid or expired'
                )
            }
        } catch {
            setStatus('error')
            setErrorMessage(
                locale === 'zh'
                    ? '验证过程中发生错误，请稍后重试'
                    : 'An error occurred during verification, please try again later'
            )
        }
    }, [token, locale])

    // 如果 URL 中有 token，自动开始验证
    useEffect(() => {
        if (token) {
            verifyEmail()
        }
    }, [token, verifyEmail])

    const handleResendEmail = async () => {
        setIsResending(true)
        try {
            await authClient.sendVerificationEmail({
                email: searchParams.get('email') || '',
                callbackURL: `/${locale}/auth/verify-email`,
            })
            toast.success(
                locale === 'zh'
                    ? '验证邮件已重新发送，请检查您的邮箱'
                    : 'Verification email resent, please check your inbox'
            )
        } catch {
            toast.error(
                locale === 'zh'
                    ? '重新发送验证邮件失败，请稍后重试'
                    : 'Failed to resend verification email, please try again later'
            )
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center space-y-6">
                {/* 正在验证 */}
                {status === 'verifying' && (
                    <>
                        <div className="flex justify-center">
                            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {locale === 'zh' ? '验证中...' : 'Verifying...'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {locale === 'zh'
                                ? '正在验证您的邮箱地址，请稍候...'
                                : 'Verifying your email address, please wait...'}
                        </p>
                    </>
                )}

                {/* 等待验证（无 token，用户刚注册） */}
                {status === 'pending' && !token && (
                    <>
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {locale === 'zh' ? '邮箱验证' : 'Email Verification'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {locale === 'zh'
                                ? '请检查您的邮箱并点击验证链接。'
                                : 'Please check your email and click the verification link.'}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            {locale === 'zh'
                                ? '提示：如果您没有收到邮件，请检查垃圾邮件文件夹，或点击下方按钮重新发送。'
                                : "Tip: If you didn't receive the email, check your spam folder or click the button below to resend."}
                        </p>

                        {searchParams.get('email') && (
                            <Button
                                onClick={handleResendEmail}
                                variant="outline"
                                disabled={isResending}
                                className="w-full"
                            >
                                {isResending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        {locale === 'zh' ? '发送中...' : 'Sending...'}
                                    </>
                                ) : locale === 'zh' ? (
                                    '重新发送验证邮件'
                                ) : (
                                    'Resend Verification Email'
                                )}
                            </Button>
                        )}

                        <Link href={`/${locale}/auth/login`}>
                            <Button variant="ghost" className="w-full mt-2">
                                {locale === 'zh' ? '返回登录' : 'Back to Login'}
                            </Button>
                        </Link>
                    </>
                )}

                {/* 验证成功 */}
                {status === 'success' && (
                    <>
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {locale === 'zh' ? '验证成功！' : 'Verification Successful!'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {locale === 'zh'
                                ? '恭喜您！邮箱验证成功，现在可以使用您的账户了。'
                                : 'Congratulations! Your email has been verified. You can now use your account.'}
                        </p>
                        <Link href={`/${locale}/auth/login`}>
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                                {locale === 'zh' ? '立即登录' : 'Login Now'}
                            </Button>
                        </Link>
                    </>
                )}

                {/* 验证失败 */}
                {status === 'error' && (
                    <>
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {locale === 'zh' ? '验证失败' : 'Verification Failed'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">{errorMessage}</p>

                        {searchParams.get('email') && (
                            <Button
                                onClick={handleResendEmail}
                                variant="outline"
                                disabled={isResending}
                                className="w-full"
                            >
                                {isResending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        {locale === 'zh' ? '发送中...' : 'Sending...'}
                                    </>
                                ) : locale === 'zh' ? (
                                    '重新发送验证邮件'
                                ) : (
                                    'Resend Verification Email'
                                )}
                            </Button>
                        )}

                        <Link href={`/${locale}/auth/login`}>
                            <Button variant="ghost" className="w-full mt-2">
                                {locale === 'zh' ? '返回登录' : 'Back to Login'}
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}
