'use client'

import { usePageTracking } from '@/hooks/use-analytics'

/**
 * 页面跟踪组件
 * 在每个页面中包含此组件以自动跟踪页面视图
 */
export function PageTracker() {
  usePageTracking()
  return null
}
