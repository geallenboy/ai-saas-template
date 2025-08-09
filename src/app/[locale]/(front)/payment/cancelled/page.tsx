import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getTranslations } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { ArrowLeft, HelpCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export async function generateMetadata({
  params: { locale },
}: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'paymentCancelled' })
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function PaymentCancelledPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'paymentCancelled' })

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-8">
          {/* cancel icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          {/* Cancel message */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('title')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('description')}
            </p>
          </div>

          {/* information card */}
          <Card className="text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                {t('needHelp')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">{t('paymentIssues')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('paymentIssuesDescription')}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">{t('moreInfo')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('moreInfoDescription')}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">{t('tryAgain')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('tryAgainDescription')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/pricing">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('backToPricing')}
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">{t('goToDashboard')}</Link>
            </Button>
          </div>

          {/* Contact support */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="ghost" size="sm">
              <Link href="/contact">
                <HelpCircle className="mr-2 h-4 w-4" />
                {t('contactSupport')}
              </Link>
            </Button>

            <Button asChild variant="ghost" size="sm">
              <Link href="/docs">{t('viewDocs')}</Link>
            </Button>
          </div>

          {/* FAQ */}
          <Card className="text-left">
            <CardHeader>
              <CardTitle className="text-lg">{t('faq')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">
                    {t('whyCancelled')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('whyCancelledDescription')}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">
                    {t('willBeCharged')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('willBeChargedDescription')}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">
                    {t('howToRetry')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('howToRetryDescription')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
