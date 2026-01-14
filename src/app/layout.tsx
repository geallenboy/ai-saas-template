import type { Metadata } from 'next'

import {
  generateOrganizationStructuredData,
  generatePageMetadata,
  generateWebsiteStructuredData,
  SEO_CONFIG,
} from '@/lib/seo-utils'

import './globals.css'

const MyAppFont = {
  variable: '--font-system',
  className: 'font-sans',
}

interface LocaleLayoutParams {
  params: Promise<{ locale?: 'zh' | 'en' }>
}

// 生成网站根metadata
export async function generateMetadata({
  params: paramsPromise,
}: LocaleLayoutParams): Promise<Metadata> {
  const params = await paramsPromise
  const locale = params.locale || 'zh'
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
  params: Promise<{ locale?: 'zh' | 'en' }>
}) {
  const params = await paramsPromise
  const locale = params.locale || 'zh'
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
      </head>
      <body className={`${MyAppFont.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
