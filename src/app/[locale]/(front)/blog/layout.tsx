import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata() {
  const t = await getTranslations('blog')

  return {
    title: {
      template: `%s | ${t('title')}`,
      default: t('title'),
    },
    description: t('description'),
  }
}

export default async function BlogLayout({ children }: Props) {
  return <>{children}</>
}
