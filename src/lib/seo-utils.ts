import type { Metadata } from 'next'

export const SEO_CONFIG = {
  siteName: 'AI SaaS Template',
  siteUrl: 'http://localhost:3000',
  defaultTitle: 'AI SaaS Template',
  defaultDescription: 'Modern AI SaaS application template',
  orgDescription: 'Providing modern AI SaaS application development solutions',
}

interface GeneratePageMetadataProps {
  type: 'website' | 'article'
  url: string
  title?: string
  description?: string
}

export function generatePageMetadata({
  type,
  url,
  title,
  description,
}: GeneratePageMetadataProps): Metadata {
  const finalTitle = title || SEO_CONFIG.defaultTitle
  const finalDescription = description || SEO_CONFIG.defaultDescription

  return {
    title: finalTitle,
    description: finalDescription,
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: `${SEO_CONFIG.siteUrl}${url}`,
      siteName: SEO_CONFIG.siteName,
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
