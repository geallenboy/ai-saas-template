import { ArrowLeftIcon, CalendarIcon, ClockIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MarkdownContent } from '@/components/front/blog/MarkdownContent'
import { formatDate, getBlogPost, getReadingTime } from '@/lib/fumadocs/blog'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const post = await getBlogPost(slug, locale)

  if (!post) {
    return {
      title: 'Not Found',
    }
  }

  return {
    title: post.title,
    description: post.summary ?? undefined,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params
  const t = await getTranslations('blog')
  const post = await getBlogPost(slug, locale)

  if (!post) {
    notFound()
  }

  const formattedDate = post.publishedAt
    ? formatDate(post.publishedAt, locale)
    : null
  const readingMinutes = post.readingMinutes ?? getReadingTime(post.content)

  return (
    <div className="container mx-auto py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <Button variant="ghost" asChild>
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {t('backToList')}
          </Link>
        </Button>

        <header className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {post.title}
          </h1>

          {post.summary && (
            <p className="text-muted-foreground text-lg">{post.summary}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {formattedDate && (
              <span className="inline-flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {formattedDate}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              {locale === 'zh'
                ? `约 ${readingMinutes} 分钟阅读`
                : `${readingMinutes} min read`}
            </span>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />
        </header>

        <MarkdownContent
          content={post.content}
          className="prose prose-gray dark:prose-invert max-w-none"
        />
      </div>
    </div>
  )
}
