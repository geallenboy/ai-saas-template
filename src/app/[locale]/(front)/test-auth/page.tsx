'use client'

import { CheckCircle, Loader2, Lock, LogOut, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useBetterAuth } from '@/lib/auth/better-auth/client'

export default function TestAuthPage() {
  const { user, isLoading, isAuthenticated, login, logout, register } =
    useBetterAuth()

  const [formMode, setFormMode] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
    setMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setMessage('')

    try {
      if (formMode === 'login') {
        const result = await login.email({
          email: formData.email,
          password: formData.password,
        })

        if (result.error) {
          setError(result.error.message || '登录失败')
        } else {
          setMessage('登录成功！')
        }
      } else {
        const result = await register.email({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        })

        if (result.error) {
          setError(result.error.message || '注册失败')
        } else {
          setMessage('注册成功！请检查邮箱验证链接。')
        }
      }
    } catch (err: any) {
      setError(err?.message || '操作失败，请稍后重试')
      console.error('Auth error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true)
      await login.social({
        provider: 'google',
        callbackURL: '/test-auth',
      })
    } catch (err: any) {
      setError(err?.message || 'Google登录失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setMessage('已退出登录')
    } catch (err: any) {
      setError(err?.message || '退出登录失败')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>正在加载认证状态...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Better Auth 测试</h1>
          <p className="mt-2 text-sm text-gray-600">
            测试 Better Auth 认证功能
          </p>
        </div>

        {isAuthenticated ? (
          // 已登录状态
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>已登录</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">用户ID: {user?.id}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">邮箱: {user?.email}</span>
                </div>
                {user?.name && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">姓名: {user.name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    邮箱验证: {user?.emailVerified ? '已验证' : '未验证'}
                  </span>
                </div>
              </div>

              <Separator />

              <Button
                onClick={handleLogout}
                className="w-full"
                variant="outline"
              >
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </Button>
            </CardContent>
          </Card>
        ) : (
          // 未登录状态
          <Card>
            <CardHeader>
              <CardTitle>
                {formMode === 'login' ? '登录测试' : '注册测试'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {formMode === 'register' && (
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="请输入您的姓名"
                        value={formData.name}
                        onChange={e =>
                          handleInputChange('name', e.target.value)
                        }
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="请输入您的邮箱"
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="请输入您的密码"
                      value={formData.password}
                      onChange={e =>
                        handleInputChange('password', e.target.value)
                      }
                      className="pl-10"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {formMode === 'login' ? '登录中...' : '注册中...'}
                    </>
                  ) : formMode === 'login' ? (
                    '登录'
                  ) : (
                    '注册'
                  )}
                </Button>
              </form>

              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">或</span>
                  </div>
                </div>

                <Button
                  onClick={handleGoogleLogin}
                  className="w-full mt-4"
                  variant="outline"
                  disabled={isSubmitting}
                >
                  使用 Google 登录
                </Button>
              </div>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() =>
                    setFormMode(formMode === 'login' ? 'register' : 'login')
                  }
                  className="text-sm text-blue-600 hover:text-blue-500"
                  disabled={isSubmitting}
                >
                  {formMode === 'login'
                    ? '没有账户？去注册'
                    : '已有账户？去登录'}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 调试信息 */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">调试信息</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto">
              {JSON.stringify(
                {
                  isAuthenticated,
                  isLoading,
                  user: user
                    ? {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        emailVerified: user.emailVerified,
                      }
                    : null,
                },
                null,
                2
              )}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
