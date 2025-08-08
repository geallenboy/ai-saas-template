'use client'

import { usePageTracking } from '@/hooks/use-analytics'

/**
 * Page Tracking Component
 * Include this component on every page to automatically track page views
 */
export function PageTracker() {
  usePageTracking()
  return null
}
