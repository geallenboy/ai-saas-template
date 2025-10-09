import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'
import { getMDXComponents } from '@/components/front/mdx/mdx-components'
import { getDocsPage } from '@/lib/fumadocs/docs'

interface Props {
  params: Promise<{
    locale: string
    slug?: string[]
  }>
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params
  const page = getDocsPage(slug || [], locale)
  if (!page) notFound()

  const MDX = page.data.body

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  )
}

export async function generateStaticParams() {
  // 暂时禁用静态生成避免构建错误
  return []
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const page = getDocsPage(slug || [], locale)
  if (!page) notFound()

  return {
    title: page.data.title,
    description: page.data.description,
  }
}
