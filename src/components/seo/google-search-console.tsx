import { logger } from '@/lib/logger'
import Script from 'next/script'

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
      {/* Google Search Console verification */}
      <meta name="google-site-verification" content={siteVerification} />

      {/* Google Search Console data layer */}
      <Script
        id="google-search-console-data"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // Providing structured data for Search Console
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

// Google Search Console related SEO tool functions
export const searchConsoleUtils = {
  // Generate sitemap URL
  generateSitemapUrl: (baseUrl: string) => {
    return `${baseUrl}/sitemap.xml`
  },

  // Generate robots.txt URL
  generateRobotsUrl: (baseUrl: string) => {
    return `${baseUrl}/robots.txt`
  },

  // Submit URL to Google Index (needs to be implemented on the server)
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
