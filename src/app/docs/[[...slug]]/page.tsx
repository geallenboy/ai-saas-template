import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'
import { getMDXComponents } from '@/components/front/mdx/mdx-components'
import {
  getDocsPage,
  getDocsPages,
  type MDXPageData,
} from '@/lib/fumadocs/docs'

interface Props {
  params: Promise<{
    slug?: string[]
  }>
}

export default async function Page({ params }: Props) {
  const { slug } = await params

  // Direct slug mapping
  // /docs -> [] (index), /docs/quickstart -> ['quickstart']
  const page = getDocsPage(slug || [])

  if (!page) notFound()

  const pageData = page.data as MDXPageData
  const MDX = pageData.body

  return (
    <DocsPage toc={pageData.toc}>
      <DocsTitle>{pageData.title}</DocsTitle>
      <DocsDescription>{pageData.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  )
}

export async function generateStaticParams() {
  const pages = getDocsPages()

  return pages.map(page => ({
    slug: page.slugs.length > 0 ? page.slugs : undefined,
  }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const page = getDocsPage(slug || [])

  if (!page) notFound()

  const pageData = page.data as MDXPageData

  return {
    title: pageData.title,
    description: pageData.description,
  }
}
