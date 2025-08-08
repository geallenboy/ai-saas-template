import {
  Calendar,
  Database,
  Eye,
  Globe,
  Lock,
  Mail,
  Shield,
  Users,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { useTranslations } from 'next-intl'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'privacy.metadata' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

const privacySectionsData = {
  informationCollection: {
    icon: Database,
    contentCount: 4,
  },
  informationUse: {
    icon: Eye,
    contentCount: 5,
  },
  informationSharing: {
    icon: Users,
    contentCount: 4,
  },
  dataSecurity: {
    icon: Lock,
    contentCount: 5,
  },
  internationalTransfers: {
    icon: Globe,
    contentCount: 4,
  },
  dataRetention: {
    icon: Calendar,
    contentCount: 4,
  },
}

const userRightsKeys = [
  'access',
  'correction',
  'deletion',
  'restriction',
  'portability',
  'objection',
]

function PrivacySection({
  section,
}: {
  section: {
    icon: React.ElementType
    title: string
    content: string[]
  }
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4">
          <section.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {section.title}
        </h3>
      </div>
      <ul className="space-y-3">
        {section.content.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-300">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function PrivacyPage() {
  const t = useTranslations('privacy')

  const privacySections = Object.entries(privacySectionsData).map(
    ([key, { icon, contentCount }]) => ({
      icon,
      title: t(`sections.${key}.title`),
      content: Array.from({ length: contentCount }, (_, i) =>
        t(`sections.${key}.content.${i}`)
      ),
    })
  )

  const userRights = userRightsKeys.map(key => ({
    title: t(`userRights.rights.${key}.title`),
    description: t(`userRights.rights.${key}.description`),
  }))

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-white via-gray-50/90 to-blue-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Shield className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{t('hero.badge')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="mt-8 text-sm text-blue-200">
              {t('hero.lastUpdated')}
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 bg-white/50 dark:bg-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('commitment.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t('commitment.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Sections */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {privacySections.map((section, index) => (
                <PrivacySection key={index} section={section} />
              ))}
            </div>
          </div>
        </section>

        {/* User Rights */}
        <section className="py-20 bg-white/50 dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('userRights.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t('userRights.description')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userRights.map((right, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center"
                >
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {right.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {right.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
              <Mail className="w-12 h-12 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">{t('contact.title')}</h2>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                {t('contact.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors">
                  {t('contact.contactUs')}
                </button>
                <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors">
                  {t('contact.dataRequest')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="py-16 bg-white/50 dark:bg-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-3">
                {t('updates.title')}
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300">
                {t('updates.description')}
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
