import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { locales } from '@/translate/i18n/config'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function localizePath(locale: string, path: string) {
  if (!path.startsWith('/')) {
    return path
  }

  if (path === '/') {
    return `/${locale}`
  }

  const hasLocalePrefix = locales.some(currentLocale => {
    return path === `/${currentLocale}` || path.startsWith(`/${currentLocale}/`)
  })

  if (hasLocalePrefix) {
    return path
  }

  return `/${locale}${path}`
}
