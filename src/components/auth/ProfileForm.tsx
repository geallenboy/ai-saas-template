'use client'

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
import { trpc } from '@/lib/trpc/client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export function ProfileForm() {
  const t = useTranslations('auth.profileForm')
  const [state, setState] = useState<{
    success?: boolean
    error?: string
  } | null>(null)

  const { data: user } = trpc.auth.getCurrentUser.useQuery()
  const utils = trpc.useUtils()

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      // Refresh user data
      utils.auth.getCurrentUser.invalidate()
      setState({ success: true })

      // Clear success message after 3 seconds
      setTimeout(() => {
        setState(null)
      }, 3000)
    },
    onError: error => {
      setState({ success: false, error: error.message || t('updateError') })
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
        language: formData.get('language') as 'en' | 'de',
        currency: formData.get('currency') as 'USD' | 'EUR',
      },
    }

    updateProfileMutation.mutate(data)
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">{t('loading')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">{t('fullName')}</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={user.fullName || ''}
              placeholder={t('fullNamePlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">{t('theme')}</Label>
              <Select
                name="theme"
                defaultValue={user.preferences?.theme || 'light'}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('themePlaceholder')} />
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
              <Label htmlFor="language">{t('language')}</Label>
              <Select
                name="language"
                defaultValue={user.preferences?.language || 'en'}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('languagePlaceholder')} />
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
            <Label htmlFor="currency">{t('currency')}</Label>
            <Select
              name="currency"
              defaultValue={user.preferences?.currency || 'USD'}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('currencyPlaceholder')} />
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
              {t('updateSuccess')}
            </div>
          )}

          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="w-full"
          >
            {updateProfileMutation.isPending ? t('saving') : t('saveChanges')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
