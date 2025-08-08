'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function UnauthorizedPage() {
  const t = useTranslations('errorPages.unauthorized')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-300">{t('message')}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('buttons.home')}
              </Link>
            </Button>

            <Button asChild>
              <Link href="/auth/sign-in">{t('buttons.login')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
