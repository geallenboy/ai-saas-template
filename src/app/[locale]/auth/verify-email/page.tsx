'use client'

import { Navigation } from '@/components/layout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertCircle, ArrowLeft, CheckCircle, Mail } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('The verification link is invalid or has expired')
      return
    }

    // Here should call API to verify email
    // Temporarily simulate the verification process
    setTimeout(() => {
      setStatus('success')
      setMessage('Email verification successful!')
    }, 2000)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              邮箱验证
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              正在验证您的邮箱地址
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {status === 'loading' && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  正在验证您的邮箱...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center space-y-4">
                <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/auth/sign-in">立即登录</Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full">
                    <Link href="/">返回首页</Link>
                  </Button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/auth/sign-in">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      返回登录
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full">
                    <Link href="/auth/sign-up">
                      <Mail className="mr-2 h-4 w-4" />
                      重新注册
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
