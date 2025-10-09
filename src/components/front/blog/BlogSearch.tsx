'use client'

import { SearchIcon, XIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// 简化的博客文章接口
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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // 获取所有标签
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    posts.forEach(post => {
      post.tags?.forEach(tag => {
        tags.add(tag)
      })
    })
    return Array.from(tags).sort()
  }, [posts])

  // 过滤文章
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

  // 通知父组件过滤结果 - 使用 useEffect 而不是 useMemo 来避免在渲染期间更新状态
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
      {/* 搜索框 */}
      <div className="relative">
        <Input
          placeholder={
            locale === 'zh'
              ? '搜索文章标题、描述或作者...'
              : 'Search articles by title, description or author...'
          }
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

      {/* 标签过滤 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {locale === 'zh' ? '按标签筛选' : 'Filter by tags'}
          </span>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              {locale === 'zh' ? '清除筛选' : 'Clear filters'}
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

      {/* 搜索结果统计 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {locale === 'zh'
            ? `找到 ${filteredPosts.length} 篇文章`
            : `Found ${filteredPosts.length} article${filteredPosts.length === 1 ? '' : 's'}`}
        </span>
        {hasFilters && (
          <span className="flex items-center gap-2">
            {locale === 'zh' ? '已应用筛选条件' : 'Filters applied'}
            {selectedTags.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedTags.length} {locale === 'zh' ? '个标签' : 'tags'}
              </Badge>
            )}
          </span>
        )}
      </div>
    </div>
  )
}
