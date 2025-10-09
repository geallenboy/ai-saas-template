'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ContentGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4 | 'auto'
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function ContentGrid({
  children,
  columns = 'auto',
  gap = 'md',
  className,
}: ContentGridProps) {
  const getColumnClasses = () => {
    if (columns === 'auto') {
      return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
    }

    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 lg:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    }

    return columnClasses[columns]
  }

  const gapClasses = {
    sm: 'gap-6',
    md: 'gap-8',
    lg: 'gap-10',
    xl: 'gap-12',
  }

  return (
    <div className={cn('grid', getColumnClasses(), gapClasses[gap], className)}>
      {children}
    </div>
  )
}

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('col-span-full', className)}>
      <div className="text-center py-16 px-6">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-3">{title}</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
        {action}
      </div>
    </div>
  )
}

interface LoadingSkeletonProps {
  count?: number
  className?: string
}

export function LoadingSkeleton({
  count = 6,
  className,
}: LoadingSkeletonProps) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div key={index} className={cn('animate-pulse', className)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-12" />
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mt-6" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
