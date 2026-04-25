'use client'

import { ArrowLeft, CheckCircle, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth/better-auth/client'

type PageStatus = 'form' | 'sending' | 'sent'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<PageStatus>('form')
    const [errorMessage, setErrorMessage] = useState('')

    const pathname = usePathname()
    const locale = pathname.split('/')[1] || 'zh'

    const isZh = locale === 'zh'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage('')

        if (!email.includes('@')) {
            setErrorMessage(
                isZh ? '请输入有效的邮箱地址' : 'Please enter a valid email address'
            )
            return
        }

        setStatus('sending')

        try {
            await authClient.requestPasswordReset({
                email,
                redirectTo: `/${locale}/auth/reset-password`,
            })
            setStatus('sent')
        } catch {
            setStatus('form')
            setErrorMessage(
                isZh
                    ? '发送重置邮件失败，请稍后重试'
                    : 'Failed to send reset email, please try again later'
            )
            toast.error(
                isZh
                    ? '发送重置邮件失败'
                    : 'Failed to send reset email'
            )
        }
    }

    const handleTryAgain = () => {
        setStatus('form')
        setEmail('')
        setErrorMessage('')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center space-y-6">
                {/* 表单状态 */}
                {(status === 'form' || status === 'sending') && (
                    <>
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                                <Mail className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isZh ? '忘记密码' : 'Forgot Password'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {isZh
                                ? '输入您的邮箱地址，我们将发送重置密码的链接给您'
                                : "Enter your email address and we'll send you a link to reset your password"}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4 text-left">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    {isZh ? '邮箱地址' : 'Email Address'}
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder={isZh ? '请输入您的邮箱' : 'Enter your email'}
                                        value={email}
                                        onChange={e => {
                                            setEmail(e.target.value)
                                            if (errorMessage) setErrorMessage('')
                                        }}
                                        className="pl-12 py-3 text-base border-2 focus:border-amber-500 transition-colors duration-300"
                                        disabled={status === 'sending'}
                                        autoComplete="email"
                                        autoFocus
                                    />
                                </div>
                                {errorMessage && (
                                    <p className="text-sm text-red-500">{errorMessage}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-3 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                disabled={status === 'sending'}
                            >
                                {status === 'sending' ? (
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        {isZh ? '发送中...' : 'Sending...'}
                                    </div>
                                ) : isZh ? (
                                    '发送重置链接'
                                ) : (
                                    'Send Reset Link'
                                )}
                            </Button>
                        </form>

                        <Link href={`/${locale}/auth/login`}>
                            <Button variant="ghost" className="w-full mt-2">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {isZh ? '返回登录' : 'Back to Login'}
                            </Button>
                        </Link>
                    </>
                )}

                {/* 邮件已发送状态 */}
                {status === 'sent' && (
                    <>
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isZh ? '查看邮箱' : 'Check Your Email'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {isZh
                                ? '我们已向您的邮箱发送了密码重置链接'
                                : "We've sent a password reset link to your email"}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            {isZh ? '重置链接已发送至' : 'Reset link sent to'}{' '}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {email}
                            </span>
                        </p>

                        <div className="pt-2 space-y-3">
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                {isZh
                                    ? '没有收到邮件？检查垃圾邮件文件夹或'
                                    : "Didn't receive the email? Check your spam folder or"}{' '}
                                <button
                                    type="button"
                                    onClick={handleTryAgain}
                                    className="text-amber-600 hover:text-amber-500 font-medium transition-colors duration-300"
                                >
                                    {isZh ? '重新尝试' : 'Try Again'}
                                </button>
                            </p>

                            <Link href={`/${locale}/auth/login`}>
                                <Button variant="ghost" className="w-full">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    {isZh ? '返回登录' : 'Back to Login'}
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
