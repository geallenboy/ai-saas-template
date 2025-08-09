import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: 'blocks' })

  return {
    title: {
      template: `%s | ${t('title')}`,
      default: t('title'),
    },
    description: t('description'),
  }
}

export default async function BlocksLayout({ children }: Props) {
  return <>{children}</>
}
