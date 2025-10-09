import type { Metadata } from 'next'
import { GoogleTools } from '@/components/front/seo/google-tools'
import { ServerStructuredData } from '@/components/front/seo/structured-data'
import {
  generateOrganizationStructuredData,
  generatePageMetadata,
  generateWebsiteStructuredData,
  SEO_CONFIG,
} from '@/lib/seo-utils'

import './globals.css'
import '../styles/pdf-viewer.css'

const MyAppFont = {
  variable: '--font-system',
  className: 'font-sans',
}

interface LocaleLayoutParams {
  params: Promise<{ locale: 'zh' | 'en' }>
}

// 生成网站根metadata
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
  params: Promise<{ locale: 'zh' | 'en' }>
}) {
  const { locale } = await paramsPromise
  const langConfig = SEO_CONFIG[locale] || SEO_CONFIG.zh

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
