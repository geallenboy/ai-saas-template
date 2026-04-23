import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { RootProvider } from 'fumadocs-ui/provider/next'
import type { ReactNode } from 'react'
import { docsSource } from '@/lib/fumadocs/docs'

type Props = {
  children: ReactNode
}

export default async function Layout({ children }: Props) {
  const tree = docsSource.getPageTree()

  return (
    <RootProvider>
      <DocsLayout tree={tree}>{children}</DocsLayout>
    </RootProvider>
  )
}
