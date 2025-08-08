import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  tags?: string[]
  locale?: string
  siteName?: string
  structuredData?: any
}

export default function SEOHead({
  title = 'AI SaaS Template - AI SaaS application development template',
  description = 'AI SaaS Template is a professional AI SaaS application development template that provides complete user authentication, payment integration, multi-language support, and modern UI components. Quickly build your AI SaaS product, covering the entire process from idea to launch.',
  keywords = [
    'AI SaaS',
    'SaaS template',
    'AI application',
    'SaaS development',
    'AI',
    'AI platform',
    'SaaS template',
    'AI tools',
    'SaaS platform',
    'AI service',
    'Smart application',
    'data integration',
    'automation scripts',
    'nocode',
    'lowcode',
    'RPA',
    'process automation',
  ],
  image = '/images/og-default.jpeg',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  tags,
  locale = 'zh_CN',
  siteName = 'AI-N8N',
  structuredData,
}: SEOHeadProps) {
  const siteUrl = 'https://aiautomatehub.org'
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`

  // Default structured data
  const defaultStructuredData = {
    '@context': 'https://aiautomatehub.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description: description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    sameAs: [
      'https://github.com/ai-saas-template',
      'https://twitter.com/aisaastemplate',
    ],
  }

  // Organization structured data
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    description:
      'Professional AI SaaS application development template platform',
    foundingDate: '2025',
    founders: [
      {
        '@type': 'Person',
        name: 'AI-N8N Team',
      },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+86-400-0000-000',
      contactType: 'customer service',
      email: 'hello@ai-saas-template.com',
    },
  }

  // Breadcrumb navigation data (if a URL path is provided)
  const breadcrumbData = url
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: url
          .split('/')
          .filter(Boolean)
          .map((segment, index, array) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: segment,
            item: `${siteUrl}/${array.slice(0, index + 1).join('/')}`,
          })),
      }
    : null

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author || 'AI-N8N Team'} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Chinese" />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />

      {/* Viewport and Character Set */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Language and Region */}
      <meta httpEquiv="Content-Language" content="zh-cn" />
      <meta name="geo.region" content="CN" />
      <meta name="geo.placename" content="China" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {author && <meta property="article:author" content={author} />}
      {tags?.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@aisaastemplate" />
      <meta name="twitter:creator" content="@aisaastemplate" />

      {/* Apple */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <meta name="apple-mobile-web-app-title" content={siteName} />

      {/* Microsoft */}
      <meta name="msapplication-TileColor" content="#2563eb" />
      <meta
        name="msapplication-TileImage"
        content="/icons/ms-icon-144x144.png"
      />
      <meta name="theme-color" content="#2563eb" />

      {/* Website icon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/icons/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/icons/favicon-16x16.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/icons/apple-touch-icon.png"
      />

      {/* RSS subscription */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`${siteName} RSS Feed`}
        href="/rss.xml"
      />

      {/* DNS pre-resolution */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData || defaultStructuredData),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData),
        }}
      />

      {breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData),
          }}
        />
      )}

      {/* Keywords related to AI SaaS */}
      <meta
        name="topic"
        content="AI SaaS, SaaS development, AI application development"
      />
      <meta
        name="summary"
        content="Learn AI SaaS development and master modern application construction and AI integration technologies"
      />
      <meta
        name="Classification"
        content="Technology, Software Development, AI"
      />
      <meta name="designer" content="AI SaaS Team" />
      <meta name="copyright" content="AI SaaS Template" />
      <meta name="reply-to" content="hello@ai-saas-template.com" />
      <meta name="owner" content="AI SaaS Template" />
      <meta name="url" content={fullUrl} />
      <meta name="identifier-URL" content={fullUrl} />
      <meta name="directory" content="submission" />
      <meta name="category" content="Technology Education Platform" />
      <meta name="coverage" content="Worldwide" />
      <meta name="distribution" content="Global" />
      <meta name="rating" content="General" />
      <meta name="revisit-after" content="7 days" />

      {/* Special tags for Chinese search engines */}
      <meta name="baidu-site-verification" content="" />
      <meta name="sogou_site_verification" content="" />
      <meta name="360-site-verification" content="" />
    </Head>
  )
}
