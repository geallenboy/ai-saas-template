import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, locales } from './config'

export default getRequestConfig(async ({ locale }) => {
  // 确保locale不为undefined，使用默认值
  // 如果locale不在支持的语言列表中，使用默认语言
  const validLocale =
    locale && locales.includes(locale as any) ? locale : defaultLocale

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  }
})
