'use client'

import {
  ChevronDown,
  ChevronRight,
  Filter,
  type LucideIcon,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CategoryItem {
  id: string
  name: string
  nameZh?: string | null
  description?: string | null
  descriptionZh?: string | null
  count?: number
  icon?: LucideIcon
}

interface StatItem {
  label: string
  value: string | number
  color?: string
}

interface CategorySidebarProps {
  title: string
  subtitle?: string
  categories: CategoryItem[]
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
  onClearFilters?: () => void
  showClearButton?: boolean
  stats?: StatItem[]
  locale?: string
  totalCount?: number
  allCategoriesText?: string
  allCategoriesIcon?: LucideIcon
  collapsible?: boolean // 是否支持收缩
  defaultExpanded?: boolean // 默认是否展开
}

export function CategorySidebar({
  title,
  subtitle,
  categories,
  selectedCategory,
  onCategoryChange,
  onClearFilters,
  showClearButton = false,
  stats,
  locale = 'zh',
  totalCount = 0,
  allCategoriesText = '全部分类',
  allCategoriesIcon: AllIcon = Filter,
  collapsible = false,
  defaultExpanded = true,
}: CategorySidebarProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  return (
    <div className="space-y-6">
      {/* 分类标题 */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-foreground flex items-center">
          <Filter className="w-5 h-5 mr-2 text-blue-500" />
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* 分类列表 */}
      <div className="space-y-2">
        {/* 全部分类 */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onCategoryChange('all')}
            className={cn(
              'group w-full rounded-xl border p-4 text-left transition-all duration-300',
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-md'
                : 'bg-white/50 dark:bg-gray-800/50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 dark:hover:from-gray-800/70 dark:hover:to-blue-900/10 border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg'
                      : 'bg-gradient-to-br from-gray-400 to-gray-600 group-hover:from-blue-500 group-hover:to-purple-600'
                  )}
                >
                  <AllIcon className="w-5 h-5 text-white" />
                </div>
                <span
                  className={cn(
                    'font-medium transition-colors',
                    selectedCategory === 'all'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-foreground group-hover:text-blue-600'
                  )}
                >
                  {allCategoriesText}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={selectedCategory === 'all' ? 'default' : 'secondary'}
                  className={cn(
                    'text-xs font-semibold',
                    selectedCategory === 'all' &&
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  )}
                >
                  {totalCount}
                </Badge>
                {collapsible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                    onClick={e => {
                      e.stopPropagation()
                      setIsExpanded(!isExpanded)
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* 动态分类 - 支持收缩 */}
        {(collapsible ? isExpanded : true) &&
          categories.map((category, index) => {
            const isSelected = selectedCategory === category.id
            const IconComponent = category.icon || Filter
            const gradientColors = [
              'from-emerald-500 to-teal-600',
              'from-violet-500 to-purple-600',
              'from-amber-500 to-orange-600',
              'from-pink-500 to-rose-600',
              'from-cyan-500 to-blue-600',
              'from-indigo-500 to-blue-600',
            ]
            const gradient = gradientColors[index % gradientColors.length]

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  'group w-full rounded-xl border p-4 text-left transition-all duration-300',
                  isSelected
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-md'
                    : 'bg-white/50 dark:bg-gray-800/50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 dark:hover:from-gray-800/70 dark:hover:to-blue-900/10 border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm',
                        isSelected
                          ? `bg-gradient-to-br ${gradient} shadow-lg`
                          : `bg-gradient-to-br from-gray-400 to-gray-600 group-hover:${gradient}`
                      )}
                    >
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          'font-medium transition-colors truncate',
                          isSelected
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-foreground group-hover:text-blue-600'
                        )}
                      >
                        {locale === 'zh'
                          ? category.nameZh || category.name
                          : category.name}
                      </div>
                      {(category.description || category.descriptionZh) && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-tight">
                          {locale === 'zh'
                            ? category.descriptionZh || category.description
                            : category.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={isSelected ? 'default' : 'secondary'}
                    className={cn(
                      'text-xs font-semibold ml-2 flex-shrink-0',
                      isSelected &&
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    )}
                  >
                    {category.count || 0}
                  </Badge>
                </div>
              </button>
            )
          })}
      </div>

      {/* 分类统计 */}
      {stats && stats.length > 0 && (
        <div className="p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/30 backdrop-blur-sm">
          <h4 className="font-semibold text-foreground mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
            统计信息
          </h4>
          <div className="space-y-3">
            {stats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
                <span
                  className={cn(
                    'font-semibold text-sm',
                    stat.color || 'text-foreground'
                  )}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 清除筛选按钮 */}
      {showClearButton && onClearFilters && (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="w-full bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300"
          >
            <Filter className="w-4 h-4 mr-2" />
            清除筛选
          </Button>
        </div>
      )}
    </div>
  )
}
