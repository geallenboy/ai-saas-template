import type { Metadata } from 'next'

export const SEO_CONFIG = {
  siteName: 'AI SaaS Template',
  siteUrl: 'http://localhost:3000',
  zh: {
    defaultTitle: 'AI SaaS 模板',
    defaultDescription: '现代化的 AI SaaS 应用模板',
    orgDescription: '提供现代化的 AI SaaS 应用开发解决方案',
  },
  en: {
    defaultTitle: 'AI SaaS Template',
    defaultDescription: 'Modern AI SaaS application template',
    orgDescription:
      'Providing modern AI SaaS application development solutions',
  },
}

interface GeneratePageMetadataProps {
  locale: 'zh' | 'en'
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
