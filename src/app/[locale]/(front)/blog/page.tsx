import { getTranslations } from 'next-intl/server'
import { formatDate, getBlogPosts, getReadingTime } from '@/lib/fumadocs/blog'
import { BlogClient } from './BlogClient'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('blog')
  const posts = await getBlogPosts(locale)

  const serializedPosts = posts.map(post => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    tags: post.tags ?? [],
    formattedDate: post.publishedAt
      ? formatDate(post.publishedAt, locale)
      : null,
    readingMinutes: post.readingMinutes ?? getReadingTime(post.content),
  }))

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <header className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          {t('description')}
        </p>
      </header>

      <BlogClient posts={serializedPosts} locale={locale} />
    </div>
  )
}
