'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import { SearchIcon, XIcon } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'

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

interface BlogSearchProps {
  posts: SimpleBlogPost[]
  locale: string
  onFilteredPosts: (posts: SimpleBlogPost[]) => void
}

export function BlogSearch({
  posts,
  locale,
  onFilteredPosts,
}: BlogSearchProps) {
  const t = useTranslations('blog.search')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Get all tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    posts.forEach(post => {
      post.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [posts])

  // Filter articles
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch =
        !searchTerm ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some(tag => post.tags?.includes(tag))

      return matchesSearch && matchesTags
    })
  }, [posts, searchTerm, selectedTags])

  // Notify parent component of filter results - use useEffect instead of useMemo to avoid updating state during render
  useEffect(() => {
    onFilteredPosts(filteredPosts)
  }, [filteredPosts, onFilteredPosts])

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedTags([])
  }

  const hasFilters = searchTerm || selectedTags.length > 0

  return (
    <div className="space-y-6">
      {/* Search box */}
      <div className="relative">
        <Input
          placeholder={t('placeholder')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm('')}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tag filtering */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{t('filterByTags')}</label>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              {t('clearFilters')}
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Search results statistics */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{t('foundArticles', { count: filteredPosts.length })}</span>
        {hasFilters && (
          <span className="flex items-center gap-2">
            {t('filtersApplied')}
            {selectedTags.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {t('tags', { count: selectedTags.length })}
              </Badge>
            )}
          </span>
        )}
      </div>
    </div>
  )
}
