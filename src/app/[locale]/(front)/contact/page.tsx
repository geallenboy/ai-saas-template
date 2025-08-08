'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Phone, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function ContactPage() {
  const t = useTranslations('contact')

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-white via-gray-50/90 to-blue-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Page title */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* contact information */}
            <div className="space-y-8">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('contactInfo')}
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {t('email')}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        alex.zanco@icloud.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {t('website')}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        <Link
                          href="https://github.com/alexzanco/ai-saas-template.git"
                          target="_blank"
                        >
                          https://github.com/alexzanco/ai-saas-template.git
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* working hours */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('workingHours')}
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      {t('monday')}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      9:00 - 18:00
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      {t('saturday')}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      10:00 - 16:00
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      {t('sunday')}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {t('closed')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* contact form */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('sendMessage')}
              </h2>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {t('form.name')}
                    </label>
                    <Input id="name" placeholder={t('form.namePlaceholder')} />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {t('form.email')}
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('form.emailPlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {t('form.subject')}
                  </label>
                  <Input
                    id="subject"
                    placeholder={t('form.subjectPlaceholder')}
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {t('form.message')}
                  </label>
                  <Textarea
                    id="message"
                    placeholder={t('form.messagePlaceholder')}
                    rows={6}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  size="lg"
                >
                  <Send className="h-5 w-5 mr-2" />
                  {t('form.send')}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
