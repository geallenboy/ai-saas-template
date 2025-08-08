import { GoogleTools } from '@/components/seo/google-tools'
import { ServerStructuredData } from '@/components/seo/structured-data'
import {
  SEO_CONFIG,
  generateOrganizationStructuredData,
  generatePageMetadata,
  generateWebsiteStructuredData,
} from '@/lib/seo-utils'
import type { Metadata } from 'next'

import './globals.css'

const MyAppFont = {
  variable: '--font-system',
  className: 'font-sans',
}

interface LocaleLayoutParams {
  params: Promise<{ locale: 'de' | 'en' }>
}

// Generate website root metadata
export async function generateMetadata({
  params: paramsPromise,
}: LocaleLayoutParams): Promise<Metadata> {
  const { locale } = await paramsPromise
  return generatePageMetadata({
    locale,
    type: 'website',
    url: '/',
  })
}

export default async function LocaleLayout({
  children,
  params: paramsPromise,
}: {
  children: React.ReactNode
  params: Promise<{ locale: 'de' | 'en' }>
}) {
  const { locale } = await paramsPromise
  const langConfig = SEO_CONFIG[locale] || SEO_CONFIG.en

  const websiteStructuredData = generateWebsiteStructuredData({
    siteName: SEO_CONFIG.siteName,
    siteUrl: SEO_CONFIG.siteUrl,
    description: langConfig.defaultDescription,
  })

  const organizationStructuredData = generateOrganizationStructuredData({
    siteName: SEO_CONFIG.siteName,
    siteUrl: SEO_CONFIG.siteUrl,
    description: langConfig.orgDescription,
  })

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <ServerStructuredData
          data={websiteStructuredData}
          id="website-structured-data"
        />
        <ServerStructuredData
          data={organizationStructuredData}
          id="organization-structured-data"
        />
      </head>
      <body className={`${MyAppFont.variable} font-sans antialiased`}>
        {children}
        <GoogleTools />
      </body>
    </html>
  )
}
