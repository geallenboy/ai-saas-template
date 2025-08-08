'use client'

import { env } from '@/env'
import { GoogleAnalytics } from '@next/third-parties/google'
import { useEffect } from 'react'
interface GoogleAnalyticsProps {
  gaId: string
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export function GoogleAnalyticsComponent({ gaId }: GoogleAnalyticsProps) {
  useEffect(() => {
    // Make sure Google Analytics is loaded
    if (typeof window !== 'undefined' && window.gtag) {
      // Configure Google Analytics
      window.gtag('config', gaId, {
        page_title: document.title,
        page_location: window.location.href,
      })
    }
  }, [gaId])

  return <GoogleAnalytics gaId={gaId} />
}

// Function to track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
      page_title: title,
    })
  }
}

// Function for tracking events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Predefined events for tracking user actions
export const trackUserAction = {
  // User sign up
  signUp: (method = 'email') => {
    trackEvent('sign_up', 'engagement', method)
  },

  // User login
  login: (method = 'email') => {
    trackEvent('login', 'engagement', method)
  },

  // Content view
  viewContent: (contentType: string, contentId: string) => {
    trackEvent('view_item', 'engagement', `${contentType}_${contentId}`)
  },

  // Search
  search: (searchTerm: string) => {
    trackEvent('search', 'engagement', searchTerm)
  },

  // Download
  download: (fileName: string) => {
    trackEvent('download', 'engagement', fileName)
  },

  // Share
  share: (method: string, contentType: string) => {
    trackEvent('share', 'engagement', `${method}_${contentType}`)
  },

  // Subscribe
  subscribe: (planName: string) => {
    trackEvent('purchase', 'ecommerce', planName)
  },

  // Tutorial start
  startTutorial: (tutorialId: string) => {
    trackEvent('tutorial_begin', 'engagement', tutorialId)
  },

  // Tutorial complete
  completeTutorial: (tutorialId: string) => {
    trackEvent('tutorial_complete', 'engagement', tutorialId)
  },
}
