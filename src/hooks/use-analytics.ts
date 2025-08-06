'use client'

import {
  trackPageView,
  trackUserAction,
} from '@/components/analytics/google-analytics'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

// Page View Tracking Hook
export function usePageTracking() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      trackPageView(url, document.title)
    }
  }, [pathname, searchParams])
}

// User behavior tracking hook
export function useUserTracking() {
  return {
    // Page related
    trackPageView: (url: string, title?: string) => {
      trackPageView(url, title)
    },

    // User behavior
    trackSignUp: (method = 'email') => {
      trackUserAction.signUp(method)
    },

    trackLogin: (method = 'email') => {
      trackUserAction.login(method)
    },

    trackContentView: (contentType: string, contentId: string) => {
      trackUserAction.viewContent(contentType, contentId)
    },

    trackSearch: (searchTerm: string) => {
      trackUserAction.search(searchTerm)
    },

    trackDownload: (fileName: string) => {
      trackUserAction.download(fileName)
    },

    trackShare: (method: string, contentType: string) => {
      trackUserAction.share(method, contentType)
    },

    trackSubscribe: (planName: string) => {
      trackUserAction.subscribe(planName)
    },

    trackTutorialStart: (tutorialId: string) => {
      trackUserAction.startTutorial(tutorialId)
    },

    trackTutorialComplete: (tutorialId: string) => {
      trackUserAction.completeTutorial(tutorialId)
    },
  }
}
