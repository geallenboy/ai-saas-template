import type { Metadata } from 'next'

export const SEO_CONFIG = {
  siteName: 'AI SaaS Template',
  siteUrl: 'http://localhost:3000',
  de: {
    defaultTitle: 'AI SaaS Vorlage',
    defaultDescription: 'Moderne AI SaaS-Anwendungsvorlage',
    orgDescription:
      'Bereitstellung moderner AI SaaS-Anwendungsentwicklungslösungen',
  },
  en: {
    defaultTitle: 'AI SaaS Template',
    defaultDescription: 'Modern AI SaaS application template',
    orgDescription:
      'Providing modern AI SaaS application development solutions',
  },
}

interface GeneratePageMetadataProps {
  locale: 'de' | 'en'
  type: 'website' | 'article'
  url: string
  title?: string
  description?: string
}

export function generatePageMetadata({
  locale,
  type,
  url,
  title,
  description,
}: GeneratePageMetadataProps): Metadata {
  const langConfig = SEO_CONFIG[locale]
  const finalTitle = title || langConfig?.defaultTitle
  const finalDescription = description || langConfig?.defaultDescription

  return {
    title: finalTitle,
    description: finalDescription,
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: `${SEO_CONFIG.siteUrl}${url}`,
      siteName: SEO_CONFIG.siteName,
      locale,
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
    },
  }
}

export function generateWebsiteStructuredData({
  siteName,
  siteUrl,
  description,
}: {
  siteName: string
  siteUrl: string
  description: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description,
  }
}

export function generateOrganizationStructuredData({
  siteName,
  siteUrl,
  description,
}: {
  siteName: string
  siteUrl: string
  description: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    description,
  }
}
