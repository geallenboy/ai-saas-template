import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatDate, getBlogPosts } from '@/lib/fumadocs/blog'
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  SearchIcon,
  TagIcon,
  TrendingUpIcon,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { BlogClient } from './BlogClient'

interface BlogFrontmatter {
  title: string
  description?: string
  author?: string
  date?: string
  tags?: string[]
}

// Simplified article data structure for client-side
interface SimpleBlogPost {
  url: string
  title: string
  description?: string
  author?: string
  date?: string
  tags?: string[]
  slugs: string[]
  formattedDate?: string
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('blog')
  const posts = getBlogPosts(locale)

  // Convert to a simplified data structure with only necessary serializable fields
  const simplePosts: SimpleBlogPost[] = posts.map(post => {
    const frontmatter = post.data as BlogFrontmatter
    return {
      url: post.url,
      title: frontmatter.title,
      description: frontmatter.description,
      author: frontmatter.author,
      date: frontmatter.date,
      tags: frontmatter.tags || [],
      slugs: post.slugs,
      formattedDate: frontmatter.date
        ? formatDate(frontmatter.date, locale)
        : undefined,
    }
  })

  // Get all tags
  const allTags = Array.from(
    new Set(simplePosts.flatMap(post => post.tags || []))
  )

  // Preprocess translation texts
  const translations = {
    title: t('title'),
    description: t('description'),
    noArticles: t('noArticles'),
    aboutReadingTime: t('aboutReadingTime', { time: 5 }),
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center text-white">
            <h1 className="mb-6 font-bold text-5xl md:text-6xl lg:text-7xl">
              {translations.title}
            </h1>
            <p className="mb-8 text-xl md:text-2xl opacity-90">
              {translations.description}
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <div className="relative w-full max-w-md">
                <Input
                  placeholder={
                    locale === 'de' ? 'Suche Beiträge...' : 'Search articles...'
                  }
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                />
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
              </div>
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-white/90"
              >
                {locale === 'de' ? 'Suche' : 'Search'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Statistics */}
        <section className="mb-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">
                  {simplePosts.length}
                </div>
                <p className="text-muted-foreground">
                  {locale === 'de' ? 'Beiträge' : 'Articles'}
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">
                  {allTags.length}
                </div>
                <p className="text-muted-foreground">
                  {locale === 'de' ? 'Tags' : 'Tags'}
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-2">
                  <TrendingUpIcon className="h-6 w-6 text-primary" />
                  <div className="text-3xl font-bold text-primary">24k</div>
                </div>
                <p className="text-muted-foreground">
                  {locale === 'de' ? 'Lesen' : 'Views'}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Blog content - Pass simplified data */}
        <BlogClient
          posts={simplePosts}
          locale={locale}
          translations={translations}
        />

        {simplePosts.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto max-w-md">
              <div className="mb-4 text-6xl">📝</div>
              <h3 className="mb-2 text-xl font-semibold">
                {locale === 'de'
                  ? 'Keine Beiträge vorhanden'
                  : 'No Articles Yet'}
              </h3>
              <p className="text-muted-foreground">{translations.noArticles}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
