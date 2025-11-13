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
  title = 'AI SaaS Template - AI SaaS应用开发模板',
  description = 'AI SaaS Template是专业的AI SaaS应用开发模板，提供完整的用户认证、支付集成、多语言支持和现代化UI组件。快速构建您的AI SaaS产品，从创意到上线全流程覆盖。',
  keywords = [
    'AI SaaS',
    'SaaS模板',
    'AI应用',
    'SaaS开发',
    '人工智能',
    'AI platform',
    'SaaS template',
    'AI工具',
    'SaaS平台',
    'AI服务',
    '智能应用',
    '数据集成',
    '自动化脚本',
    'nocode',
    'lowcode',
    'RPA',
    '流程自动化',
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

  // 默认结构化数据
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
      'https://github.com/geallenboy/ai-saas-template',
      'https://twitter.com/aisaastemplate',
    ],
  }

  // 组织结构化数据
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    description: '专业的AI SaaS应用开发模板平台',
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

  // 面包屑导航数据（如果提供了URL路径）
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
      {/* 基础Meta标签 */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author || 'AI-N8N Team'} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Chinese" />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />

      {/* 视口和字符集 */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* 语言和地区 */}
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

      {/* 网站图标 */}
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

      {/* RSS订阅 */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`${siteName} RSS Feed`}
        href="/rss.xml"
      />

      {/* DNS预解析 */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />

      {/* 结构化数据 */}
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

      {/* 专门针对AI SaaS相关的技术关键词 */}
      <meta
        name="topic"
        content="AI SaaS, SaaS development, AI application development"
      />
      <meta
        name="summary"
        content="学习AI SaaS开发，掌握现代化应用构建和AI集成技术"
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

      {/* 针对中文搜索引擎的特殊标签 */}
      <meta name="baidu-site-verification" content="" />
      <meta name="sogou_site_verification" content="" />
      <meta name="360-site-verification" content="" />
    </Head>
  )
}
