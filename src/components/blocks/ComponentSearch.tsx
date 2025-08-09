'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchIcon, XIcon, FilterIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { categories } from '@/lib/blocks-registry'

interface ComponentSearchProps {
  locale: string
  onCategoryFilter?: (categoryId: string | null) => void
  className?: string
}

export function ComponentSearch({
  locale,
  onCategoryFilter,
  className,
}: ComponentSearchProps) {
  const t = useTranslations('blocks.searchField')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleCategoryToggle = (categoryId: string) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId
    setSelectedCategory(newCategory)
    onCategoryFilter?.(newCategory)
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedCategory(null)
    onCategoryFilter?.(null)
  }

  const hasFilters = searchTerm || selectedCategory

  return (
    <div className={`space-y-6 ${className}`}>
      {/* search box */}
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

      {/* Filtering */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium">
            <FilterIcon className="h-4 w-4" />
            {t('filterByCategory')}
          </label>
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
          {categories.map(category => {
            const IconComponent = category.icon
            return (
              <Badge
                key={category.id}
                variant={
                  selectedCategory === category.id ? 'default' : 'outline'
                }
                className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground flex items-center gap-1"
                onClick={() => handleCategoryToggle(category.id)}
              >
                <IconComponent className="h-3 w-3" />
                {category.name}
                <span className="ml-1 text-xs opacity-70">
                  ({category.count})
                </span>
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Quick filter button */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleCategoryToggle('')}
          className="text-xs"
        >
          {t('all')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => {
            // Here you can add the logic for the latest components
          }}
        >
          {t('latest')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => {
            // Here you can add the logic for the popular components
          }}
        >
          {t('popular')}
        </Button>
      </div>

      {/* Search results statistics */}
      {hasFilters && (
        <div className="text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            {t('filtersApplied')}
            {selectedCategory && (
              <Badge variant="secondary" className="text-xs">
                {categories.find(c => c.id === selectedCategory)?.name}
              </Badge>
            )}
          </span>
        </div>
      )}
    </div>
  )
}
