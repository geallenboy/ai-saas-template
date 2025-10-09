'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  SUPPORTED_CURRENCIES,
  SUPPORTED_LANGUAGES,
  THEME_OPTIONS,
} from '@/constants/auth'
import { trpc } from '@/server/client'

export function ProfileForm() {
  const [state, setState] = useState<{
    success?: boolean
    error?: string
  } | null>(null)

  const { data: user } = trpc.auth.getCurrentUser.useQuery()
  const utils = trpc.useUtils()

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      // 刷新用户数据
      utils.auth.getCurrentUser.invalidate()
      setState({ success: true })

      // 3秒后清除成功消息
      setTimeout(() => {
        setState(null)
      }, 3000)
    },
    onError: error => {
      setState({ success: false, error: error.message || '更新失败，请重试' })
    },
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setState(null)

    const formData = new FormData(event.currentTarget)

    const data = {
      fullName: formData.get('fullName') as string,
      preferences: {
        theme: formData.get('theme') as 'light' | 'dark',
        language: formData.get('language') as 'en' | 'zh',
        currency: formData.get('currency') as 'USD' | 'CNY',
      },
    }

    updateProfileMutation.mutate(data)
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">加载中...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>编辑资料</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">姓名</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={user.fullName || ''}
              placeholder="请输入您的姓名"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">主题</Label>
              <Select
                name="theme"
                defaultValue={user.preferences?.theme || 'light'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择主题" />
                </SelectTrigger>
                <SelectContent>
                  {THEME_OPTIONS.map(theme => (
                    <SelectItem key={theme.value} value={theme.value}>
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">语言</Label>
              <Select
                name="language"
                defaultValue={user.preferences?.language || 'en'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择语言" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">货币</Label>
            <Select
              name="currency"
              defaultValue={user.preferences?.currency || 'USD'}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择货币" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map(currency => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {state?.error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
              资料更新成功！
            </div>
          )}

          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="w-full"
          >
            {updateProfileMutation.isPending ? '保存中...' : '保存更改'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
