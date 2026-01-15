import type { Metadata } from 'next'
import { GlobalProviders } from '@/components/common/global-providers'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'AI SaaS Template',
    template: '%s | AI SaaS Template',
  },
  description: 'A production-ready AI SaaS template built with Next.js',
  keywords: ['AI', 'SaaS', 'Next.js', 'TypeScript', 'tRPC'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  )
}
