/**
 * Universal paging component
 */

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

interface FrontPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showInfo?: boolean
  totalCount?: number
  pageSize?: number
}

export function FrontPagination({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  totalCount,
  pageSize = 10,
}: FrontPaginationProps) {
  const t = useTranslations('common.pagination')

  if (totalPages <= 1) {
    return null
  }

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    // Remove duplicates
    return Array.from(new Set(rangeWithDots))
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-between">
      {showInfo && totalCount && (
        <div className="text-sm text-muted-foreground">
          {t('showingRecords', {
            start: (currentPage - 1) * pageSize + 1,
            end: Math.min(currentPage * pageSize, totalCount),
            total: totalCount,
          })}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('previous')}
        </Button>

        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-muted-foreground">...</span>
            ) : (
              <Button
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className="min-w-[2.5rem]"
                title={t('goToPage', { page })}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1"
        >
          {t('next')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default FrontPagination
