import { GlobalProviders } from '@/components/providers/global-providers'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

export default async function LocaleLayout({
  children,
  params: paramsPromise,
}: {
  children: React.ReactNode
  params: Promise<{ locale: 'de' | 'en' }>
}) {
  const { locale } = await paramsPromise
  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <GlobalProviders>{children}</GlobalProviders>
    </NextIntlClientProvider>
  )
}
