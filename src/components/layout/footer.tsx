'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

export default function Footer() {
  const locale = useLocale()
  const t = useTranslations('footer')
  const localePath = (path: string) => `/${locale}${path}`

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <span className="text-xl font-bold">{t('brand.name')}</span>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md">
              {t('brand.slogan')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
              {t('links.product.title')}
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href={localePath('/pricing')}
                  className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {t('links.product.pricing')}
                </Link>
              </li>
              <li>
                <Link
                  href={localePath('/docs')}
                  className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {t('links.product.documentation')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
              {t('links.support.title')}
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href={localePath('/contact')}
                  className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {t('links.company.contact')}
                </Link>
              </li>
              <li>
                <Link
                  href={localePath('/privacy')}
                  className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {t('links.legal.privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">
            {t('copyrightText')}
          </p>
        </div>
      </div>
    </footer>
  )
}
