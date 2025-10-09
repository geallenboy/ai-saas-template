'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { env } from '@/env'

export function GoogleTools() {
  const gaId = env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  if (!gaId) {
    return null
  }

  return <GoogleAnalytics gaId={gaId} />
}
