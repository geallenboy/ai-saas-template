import { Faq } from '@/components/blocks/faq/faq'
import { Features } from '@/components/blocks/features/features'
import { Footer } from '@/components/blocks/footer/footer'
import { Hero } from '@/components/blocks/hero/hero'

import { TechStack } from '@/components/blocks/tech-stack/tech-stack'
import { getTranslations } from 'next-intl/server'
import { ComponentPreviewWrapper } from './component-preview-wrapper'

interface ServerComponentPreviewProps {
  componentId: string
  name: string
  code: string
  locale: string
}

export async function ServerComponentPreview({
  componentId,
  name,
  code,
  locale,
}: ServerComponentPreviewProps) {
  const t = await getTranslations({
    locale,
    namespace: 'blocksCategoryPage',
  })
  const renderComponent = () => {
    switch (componentId) {
      case 'modern-hero':
        return <Hero />
      case 'tech-stack':
        return <TechStack />
      case 'features':
        return <Features />

      case 'faq3':
        return <Faq />
      case 'footer-7':
        return <Footer />
      default:
        return (
          <div className="p-8 text-center text-muted-foreground">
            {t('componentNotFound')}
          </div>
        )
    }
  }

  return (
    <ComponentPreviewWrapper name={name} code={code}>
      {renderComponent()}
    </ComponentPreviewWrapper>
  )
}
