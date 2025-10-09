'use client'

import { CalendarIcon, ClockIcon, TagIcon } from 'lucide-react'
import Link from 'next/link'
import { useId, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface BlogListItem {
  id: string
  slug: string
  title: string
  summary: string | null
  tags: string[]
  formattedDate: string | null
  readingMinutes: number | null
}

interface BlogClientProps {
  posts: BlogListItem[]
  locale: string
}

export function BlogClient({ posts, locale }: BlogClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const searchInputId = useId()

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagSet.add(tag)
      })
    })
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b))
  }, [posts])

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = searchTerm
        ? [post.title, post.summary ?? '', post.tags.join(' ')]
            .join(' ')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true

      const matchesTag = activeTag ? post.tags.includes(activeTag) : true

      return matchesSearch && matchesTag
    })
  }, [posts, searchTerm, activeTag])

  const handleResetFilters = () => {
    setSearchTerm('')
    setActiveTag(null)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 space-y-2">
          <label
            className="text-sm font-medium text-muted-foreground"
            htmlFor={searchInputId}
          >
            {locale === 'zh' ? '搜索文章' : 'Search articles'}
          </label>
          <Input
            id={searchInputId}
            placeholder={
              locale === 'zh'
                ? '输入标题、摘要或标签...'
                : 'Search by title, summary or tag...'
            }
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            className="h-11"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {locale === 'zh' ? '筛选标签' : 'Filter by tag'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge
                key="__all"
                variant={activeTag === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={handleResetFilters}
              >
                {locale === 'zh' ? '全部' : 'All'}
              </Badge>
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={activeTag === tag ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() =>
                    setActiveTag(current => (current === tag ? null : tag))
                  }
                >
                  <TagIcon className="mr-1 h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {locale === 'zh'
                ? '没有找到匹配的文章，试试其他关键词或标签。'
                : 'No articles found. Try a different keyword or tag.'}
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map(post => (
            <article
              key={post.id}
              className="rounded-lg border border-border/70 bg-card/60 p-6 shadow-sm transition hover:border-primary/60 hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="space-y-2">
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="group inline-flex items-center gap-2"
                  >
                    <h3 className="text-2xl font-semibold tracking-tight group-hover:text-primary">
                      {post.title}
                    </h3>
                  </Link>
                  {post.summary && (
                    <p className="text-muted-foreground">{post.summary}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {post.formattedDate && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {post.formattedDate}
                    </span>
                  )}
                  {post.readingMinutes && (
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {locale === 'zh'
                        ? `约 ${post.readingMinutes} 分钟阅读`
                        : `${post.readingMinutes} min read`}
                    </span>
                  )}
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

                <div className="pt-2">
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {locale === 'zh' ? '阅读全文 →' : 'Read article →'}
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
