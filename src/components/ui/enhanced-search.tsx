'use client'

import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EnhancedSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onClear?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function EnhancedSearch({
  value,
  onChange,
  placeholder = '搜索...',
  className,
  onClear,
  size = 'md',
}: EnhancedSearchProps) {
  const sizeClasses = {
    sm: 'py-2 px-3 pl-10 text-sm',
    md: 'py-3 px-4 pl-12 text-base',
    lg: 'py-4 px-6 pl-14 text-lg',
  }

  const iconSizes = {
    sm: 'h-4 w-4 left-3',
    md: 'h-5 w-5 left-4',
    lg: 'h-6 w-6 left-5',
  }

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative group">
        <Search
          className={cn(
            'absolute top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200',
            iconSizes[size]
          )}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={cn(
            'w-full border-2 border-gray-200/60 dark:border-gray-700/60 rounded-3xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm',
            'focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/60 focus:bg-white dark:focus:bg-gray-800',
            'transition-all duration-300 shadow-sm hover:shadow-md group-focus-within:shadow-lg',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            sizeClasses[size]
          )}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 装饰性元素 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/3 to-indigo-500/3 rounded-3xl -z-10 group-focus-within:from-blue-500/8 group-focus-within:via-purple-500/8 group-focus-within:to-indigo-500/8 transition-all duration-300" />
    </div>
  )
}
