import { getRequestConfig } from 'next-intl/server'
import { defaultLocale } from './config'

export default getRequestConfig(async ({ locale }) => {
  // Make sure locale is not undefined and use the default value
  const validLocale = locale || defaultLocale

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  }
})
