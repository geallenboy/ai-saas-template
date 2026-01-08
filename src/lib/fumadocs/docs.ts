import type { InferMetaType, InferPageType } from 'fumadocs-core/source'
import { loader } from 'fumadocs-core/source'
import { cache } from 'react'
import type { MDXContent } from 'mdx/types'
import type { TOCItemType } from 'fumadocs-core/toc'
import { docs } from '@/.source/server'

// Single source configuration - content is in src/content/docs/
// UI elements are translated via next-intl
export const docsSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
})

export type DocsMeta = InferMetaType<typeof docsSource>
export type DocsPage = InferPageType<typeof docsSource>

// Extended PageData interface to include MDX-specific properties
export interface MDXPageData {
  title?: string
  description?: string
  body: MDXContent
  toc: TOCItemType[]
  structuredData: any
  _exports: Record<string, unknown>
}

// Get all pages (no locale filtering needed)
export const getDocsPages = cache((): DocsPage[] => {
  return docsSource.getPages()
})

// Get a specific page by slug
export const getDocsPage = cache((slug: string[]): DocsPage | undefined => {
  return docsSource.getPage(slug)
})
