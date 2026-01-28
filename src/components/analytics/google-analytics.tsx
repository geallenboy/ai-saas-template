'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { useEffect } from 'react'
import { env } from '@/env'

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
    // 确保Google Analytics已加载
    if (typeof window === 'undefined') {
      return
    }

    const gtag = window?.gtag

    if (!gtag) {
      return
    }

    // 配置Google Analytics
    gtag('config', gaId, {
      page_title: document.title,
      page_location: window.location.href,
    })
  }, [gaId])

  return <GoogleAnalytics gaId={gaId} />
}

// 用于跟踪页面视图的函数
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined') {
    return
  }

  const measurementId = env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const gtag = window?.gtag

  if (!measurementId || typeof gtag !== 'function') {
    return
  }

  gtag('config', measurementId, {
    page_path: url,
    page_title: title,
  })
}

// 用于跟踪事件的函数
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window === 'undefined') {
    return
  }

  const gtag = window?.gtag

  if (!gtag) {
    return
  }

  gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  })
}

// 用于跟踪用户行为的预定义事件
export const trackUserAction = {
  // 用户注册
  signUp: (method = 'email') => {
    trackEvent('sign_up', 'engagement', method)
  },

  // 用户登录
  login: (method = 'email') => {
    trackEvent('login', 'engagement', method)
  },

  // 内容查看
  viewContent: (contentType: string, contentId: string) => {
    trackEvent('view_item', 'engagement', `${contentType}_${contentId}`)
  },

  // 搜索
  search: (searchTerm: string) => {
    trackEvent('search', 'engagement', searchTerm)
  },

  // 下载
  download: (fileName: string) => {
    trackEvent('download', 'engagement', fileName)
  },

  // 分享
  share: (method: string, contentType: string) => {
    trackEvent('share', 'engagement', `${method}_${contentType}`)
  },

  // 订阅
  subscribe: (planName: string) => {
    trackEvent('purchase', 'ecommerce', planName)
  },

  // 教程开始
  startTutorial: (tutorialId: string) => {
    trackEvent('tutorial_begin', 'engagement', tutorialId)
  },

  // 教程完成
  completeTutorial: (tutorialId: string) => {
    trackEvent('tutorial_complete', 'engagement', tutorialId)
  },
}
