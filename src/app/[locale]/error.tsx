'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const t = useTranslations('errorPages.error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-300">{t('development')}</p>

          {process.env.NODE_ENV === 'development' && (
            <div className="text-left bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
              <p className="font-mono text-red-600 dark:text-red-400">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('buttons.retry')}
            </Button>

            <Button onClick={() => (window.location.href = '/')}>
              <Home className="w-4 h-4 mr-2" />
              {t('buttons.home')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
