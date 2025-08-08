'use client'

import { PricingPlans } from '@/components/payment'
import { useTranslations } from 'next-intl'

export default function PricingPage() {
  const t = useTranslations('pricingPage')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Page title */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Pricing plan components */}
        <PricingPlans />

        {/* FAQ section */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('faq.title')}</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('faq.description')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {t('faq.questions.cancel.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('faq.questions.cancel.answer')}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {t('faq.questions.payment.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('faq.questions.payment.answer')}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {t('faq.questions.upgrade.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('faq.questions.upgrade.answer')}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {t('faq.questions.trial.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('faq.questions.trial.answer')}
              </p>
            </div>
          </div>
        </div>

        {/* Contact support */}
        <div className="text-center mt-16 p-8 bg-white/50 dark:bg-white/5 rounded-2xl backdrop-blur-sm">
          <h3 className="text-2xl font-bold mb-4">{t('contact.title')}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('contact.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t('contact.contactUs')}
            </a>
            <a
              href="/docs"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t('contact.viewDocs')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
