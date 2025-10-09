import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { RootProvider } from 'fumadocs-ui/provider'
import { getMessages } from 'next-intl/server'
import type { ReactNode } from 'react'
import { buildDocsTree } from '@/lib/fumadocs/docs'
import { localizePath } from '@/lib/utils'
import { locales } from '@/translate/i18n/routing'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function Layout({ children, params }: Props) {
  const { locale } = await params
  const messages = await getMessages()

  // Get the nested tree structure
  const treeItems = buildDocsTree(locale)

  // Convert tree items to fumadocs format recursively
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convertTreeItems = (items: typeof treeItems): any[] => {
    return items.map(item => {
      if (item.type === 'folder') {
        return {
          type: 'folder',
          name: item.name,
          defaultOpen: item.defaultOpen,
          children: item.children ? convertTreeItems(item.children) : [],
        }
      }
      return {
        type: 'page',
        name: item.name,
        url: localizePath(locale, item.url || '/docs'),
      }
    })
  }

  const tree = {
    name: 'Documentation',
    children: convertTreeItems(treeItems),
  }

  const navUrl = localizePath(locale, '/docs')

  return (
    <RootProvider
      i18n={{
        locale,
        locales: locales as any[],
        translations: messages.Docs,
      }}
      theme={{
        enabled: false,
      }}
    >
      <DocsLayout
        tree={tree}
        nav={{
          title: 'AI SaaS Template Docs',
          url: navUrl,
        }}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  )
}
