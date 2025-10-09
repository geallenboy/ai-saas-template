import Script from 'next/script'
import { logger } from '@/lib/logger'

interface GoogleSearchConsoleProps {
  siteVerification?: string
}

export function GoogleSearchConsole({
  siteVerification,
}: GoogleSearchConsoleProps) {
  if (!siteVerification) {
    return null
  }

  return (
    <>
      {/* Google Search Console验证 */}
      <meta name="google-site-verification" content={siteVerification} />

      {/* Google Search Console的数据层 */}
      <Script
        id="google-search-console-data"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // 为Search Console提供结构化数据
            gtag('event', 'page_view', {
              'custom_map': {
                'metric1': 'search_console_page'
              }
            });
          `,
        }}
      />
    </>
  )
}

// Google Search Console相关的SEO工具函数
export const searchConsoleUtils = {
  // 生成站点地图URL
  generateSitemapUrl: (baseUrl: string) => {
    return `${baseUrl}/sitemap.xml`
  },

  // 生成robots.txt URL
  generateRobotsUrl: (baseUrl: string) => {
    return `${baseUrl}/robots.txt`
  },

  // 提交URL到Google索引（需要在服务端实现）
  submitUrlForIndexing: async (url: string, accessToken: string) => {
    try {
      const response = await fetch(
        'https://indexing.googleapis.com/v3/urlNotifications:publish',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            url: url,
            type: 'URL_UPDATED',
          }),
        }
      )
      return response.json()
    } catch (error) {
      logger.error(
        'Failed to submit URL to Google Search Console',
        error as Error,
        {
          category: 'seo',
          component: 'GoogleSearchConsole',
          url: url.substring(0, 100),
        }
      )
      throw error
    }
  },
}
