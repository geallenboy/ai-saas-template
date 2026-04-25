'use client'

import { ArrowLeft, CheckCircle, Eye, EyeOff, Loader2, Lock, XCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth/better-auth/client'

type PageStatus = 'form' | 'submitting' | 'success' | 'invalid'

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [status, setStatus] = useState<PageStatus>('form')
    const [errorMessage, setErrorMessage] = useState('')

    const pathname = usePathname()
    const searchParams = useSearchParams()
    const locale = pathname.split('/')[1] || 'zh'
    const token = searchParams.get('token')

    const isZh = locale === 'zh'

    // 如果没有 token，显示无效链接
    if (!token && status === 'form') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isZh ? '无效的重置链接' : 'Invalid Reset Link'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {isZh
                            ? '此密码重置链接无效或已过期。'
                            : 'This password reset link is invalid or has expired.'}
                    </p>
                    <div className="space-y-3">
                        <Link href={`/${locale}/auth/forgot-password`}>
                            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                                {isZh ? '申请新的重置链接' : 'Request New Reset Link'}
                            </Button>
                        </Link>
                        <Link href={`/${locale}/auth/login`}>
                            <Button variant="ghost" className="w-full">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {isZh ? '返回登录' : 'Back to Login'}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const validateForm = (): boolean => {
        if (newPassword.length < 8) {
            setErrorMessage(
                isZh ? '密码长度至少为8个字符' : 'Password must be at least 8 characters'
            )
            return false
        }
        if (newPassword !== confirmPassword) {
            setErrorMessage(
                isZh ? '密码和确认密码不匹配' : 'Passwords do not match'
            )
            return false
        }
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage('')

        if (!validateForm()) return

        setStatus('submitting')

        try {
            await authClient.resetPassword({
                newPassword,
                token: token as string,
            })
            setStatus('success')
            toast.success(
                isZh ? '密码重置成功！' : 'Password reset successful!'
            )
        } catch {
            setStatus('form')
            setErrorMessage(
                isZh
                    ? '重置密码失败，链接可能已过期，请重新申请'
                    : 'Failed to reset password. The link may have expired, please request a new one'
            )
            toast.error(
                isZh ? '重置密码失败' : 'Failed to reset password'
            )
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center space-y-6">
                {/* 表单状态 */}
                {(status === 'form' || status === 'submitting') && (
                    <>
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                                <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isZh ? '重置密码' : 'Reset Password'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {isZh ? '请输入您的新密码' : 'Enter your new password below'}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4 text-left">
                            {/* 新密码 */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="newPassword"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    {isZh ? '新密码' : 'New Password'}
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder={isZh ? '请输入新密码（至少8位）' : 'Enter new password (min 8 chars)'}
                                        value={newPassword}
                                        onChange={e => {
                                            setNewPassword(e.target.value)
                                            if (errorMessage) setErrorMessage('')
                                        }}
                                        className="pl-12 pr-12 py-3 text-base border-2 focus:border-amber-500 transition-colors duration-300"
                                        disabled={status === 'submitting'}
                                        autoComplete="new-password"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* 确认密码 */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="confirmPassword"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    {isZh ? '确认新密码' : 'Confirm New Password'}
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder={isZh ? '请确认您的新密码' : 'Confirm your new password'}
                                        value={confirmPassword}
                                        onChange={e => {
                                            setConfirmPassword(e.target.value)
                                            if (errorMessage) setErrorMessage('')
                                        }}
                                        className="pl-12 pr-12 py-3 text-base border-2 focus:border-amber-500 transition-colors duration-300"
                                        disabled={status === 'submitting'}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {errorMessage && (
                                <p className="text-sm text-red-500 text-center">{errorMessage}</p>
                            )}

                            <Button
                                type="submit"
                                className="w-full py-3 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                disabled={status === 'submitting'}
                            >
                                {status === 'submitting' ? (
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        {isZh ? '重置中...' : 'Resetting...'}
                                    </div>
                                ) : isZh ? (
                                    '重置密码'
                                ) : (
                                    'Reset Password'
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

                {/* 重置成功 */}
                {status === 'success' && (
                    <>
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isZh ? '密码重置成功！' : 'Password Reset Successful!'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {isZh
                                ? '您的密码已成功更新。'
                                : 'Your password has been successfully updated.'}
                        </p>
                        <Link href={`/${locale}/auth/login`}>
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                                {isZh ? '使用新密码登录' : 'Sign In with New Password'}
                            </Button>
                        </Link>
                    </>
                )}

                {/* 无效链接 */}
                {status === 'invalid' && (
                    <>
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isZh ? '重置失败' : 'Reset Failed'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {isZh
                                ? '此密码重置链接无效或已过期。'
                                : 'This password reset link is invalid or has expired.'}
                        </p>
                        <div className="space-y-3">
                            <Link href={`/${locale}/auth/forgot-password`}>
                                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                                    {isZh ? '申请新的重置链接' : 'Request New Reset Link'}
                                </Button>
                            </Link>
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
