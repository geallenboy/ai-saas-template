import { defineRouting } from 'next-intl/routing'
import { defaultLocale, locales } from './config'

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Routing configuration - use 'always' to maintain consistency with your existing setup
  localePrefix: 'always',
  localeDetection: false,

  // Path prefix configuration for non-default locales
  pathnames: {
    '/': '/',
    '/docs': '/docs',
    '/blog': '/blog',
    '/pricing': '/pricing',
    '/about': '/about',
    '/contact': '/contact',
    '/features': '/features',
    '/help': '/help',
    '/privacy': '/privacy',
    '/settings': '/settings',
  },
})

// Re-export for convenience
export { locales, defaultLocale }

// Type definitions
export type Locale = (typeof locales)[number]
export type Pathnames = keyof typeof routing.pathnames
