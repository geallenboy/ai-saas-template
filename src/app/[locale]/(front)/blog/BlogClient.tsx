'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { BlogSearch } from '@/components/blog/BlogSearch'
import { CalendarIcon, ClockIcon, UserIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

// Simplified blog post interface
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

interface BlogTranslations {
  title: string
  description: string
  noArticles: string
  aboutReadingTime: string
}

interface BlogClientProps {
  posts: SimpleBlogPost[]
  locale: string
  translations: BlogTranslations
}

export function BlogClient({ posts, locale, translations }: BlogClientProps) {
  const t = useTranslations('blog.client')
  const [filteredPosts, setFilteredPosts] = useState(posts)

  // Get all tags
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags || [])))

  // Get featured posts (here simply sorted by date)
  const featuredPosts = posts.slice(0, 3)

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      {/* Main content area */}
      <div className="lg:col-span-3">
        {/* Search and filter */}
        <div className="mb-8">
          <BlogSearch
            posts={posts}
            locale={locale}
            onFilteredPosts={setFilteredPosts}
          />
        </div>

        {/* Featured Articles */}
        {featuredPosts.length > 0 && filteredPosts.length === posts.length && (
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {t('featuredArticles')}
              </h2>
              <p className="text-muted-foreground">
                {t('featuredDescription')}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.map(post => (
                <FeaturedPostCard
                  key={post.url}
                  post={post}
                  locale={locale}
                  translations={translations}
                />
              ))}
            </div>
          </section>
        )}

        {/* Blog post list */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {filteredPosts.length === posts.length
                ? t('latestArticles')
                : t('searchResults')}
            </h2>
            <p className="text-muted-foreground">
              {t('articlesFound', { count: filteredPosts.length })}
            </p>
          </div>

          <div className="grid gap-6">
            {filteredPosts.map(post => (
              <BlogPostCard
                key={post.url}
                post={post}
                locale={locale}
                translations={translations}
              />
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto max-w-md">
                <div className="mb-4 text-6xl">🔍</div>
                <h3 className="mb-2 text-xl font-semibold">
                  {t('noArticlesFound')}
                </h3>
                <p className="text-muted-foreground">
                  {t('noArticlesDescription')}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <div className="space-y-8">
        {/* Popular Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('popularTags')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 15).map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Article archive */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('archives')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-sm">
                {t('january')} (3)
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm">
                {t('december')} (2)
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm">
                {t('november')} (1)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscribe Notification */}
        <Card className="bg-gradient-to-br from-primary/10 to-purple-600/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="mb-2 font-semibold">{t('subscribeTitle')}</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {t('subscribeDescription')}
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder={t('subscribePlaceholder')}
                  className="w-full px-3 py-2 text-sm border rounded-md text-center"
                />
                <Button className="w-full">{t('subscribe')}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Featured Article Card Component
function FeaturedPostCard({
  post,
  locale,
  translations,
}: {
  post: SimpleBlogPost
  locale: string
  translations: BlogTranslations
}) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="aspect-video overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="flex h-full items-center justify-center text-white">
          <div className="text-center">
            <div className="text-4xl mb-2">📖</div>
            <div className="text-sm font-medium">Featured</div>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="mb-2 font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
          <Link href={`/${locale}/blog/${post.slugs.slice(1).join('/')}`}>
            {post.title}
          </Link>
        </h3>
        {post.description && (
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
            {post.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {post.author && (
              <span className="flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                {post.author}
              </span>
            )}
          </div>
          {post.formattedDate && <span>{post.formattedDate}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

// Featured Article Card Component
function BlogPostCard({
  post,
  locale,
  translations,
}: {
  post: SimpleBlogPost
  locale: string
  translations: BlogTranslations
}) {
  return (
    <Card className="group transition-all hover:shadow-lg hover:border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="mb-2 text-xl group-hover:text-primary transition-colors">
              <Link
                href={`/${locale}/blog/${post.slugs.slice(1).join('/')}`}
                className="hover:underline"
              >
                {post.title}
              </Link>
            </CardTitle>
            {post.description && (
              <CardDescription className="text-base line-clamp-2">
                {post.description}
              </CardDescription>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
          {post.author && (
            <div className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
          )}

          {post.formattedDate && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{post.formattedDate}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            <span>{translations.aboutReadingTime}</span>
          </div>
        </div>
      </CardHeader>

      {post.tags && post.tags.length > 0 && (
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
