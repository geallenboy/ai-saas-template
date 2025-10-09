'use client'

import { LogIn, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/auth'

export function SignInButton() {
  const { isAuthenticated } = useAuth()
  const locale = useLocale()
  const t = useTranslations('navigation')

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/${locale}/auth/login`}>
          <LogIn className="h-4 w-4 mr-2" />
          {t('signIn')}
        </Link>
      </Button>
      <Button size="sm" asChild>
        <Link href={`/${locale}/auth/register`}>
          <UserPlus className="h-4 w-4 mr-2" />
          {t('signUp')}
        </Link>
      </Button>
    </div>
  )
}
