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

export const metadata = {
  title: 'Privacy Policy - AI SaaS Template',
  description:
    'Learn how AI SaaS Template collects, uses, and protects your personal information. We are committed to safeguarding your privacy rights.',
}

const privacySections = [
  {
    icon: Database,
    title: 'Information Collection',
    content: [
      'We collect information you actively provide, such as your name and email address when registering an account.',
      'We automatically collect technical information, including IP address, browser type, device information, etc.',
      'We use analytics data to help us improve service quality.',
      'We collect information through cookies and similar technologies.',
    ],
  },
  {
    icon: Eye,
    title: 'Information Use',
    content: [
      'We use your information to provide, maintain, and improve our services.',
      'We process transactions and send related notifications.',
      'We respond to your inquiries and provide customer support.',
      'We send important updates and marketing information (you can opt-out).',
      'We prevent fraud and ensure the security of our services.',
    ],
  },
  {
    icon: Users,
    title: 'Information Sharing',
    content: [
      'We do not sell your personal information to third parties.',
      'We may share necessary information with service providers to deliver our services.',
      'We may disclose information when required by law or to protect rights.',
      'In the event of a business transfer, information may be transferred as part of the assets.',
    ],
  },
  {
    icon: Lock,
    title: 'Data Security',
    content: [
      'We use industry-standard encryption technologies to protect data transmission.',
      'We implement strict access controls and authentication measures.',
      'We conduct regular security audits and vulnerability assessments.',
      'Employees receive training on privacy and security.',
      'Data backup and disaster recovery plans are in place.',
    ],
  },
  {
    icon: Globe,
    title: 'International Transfers',
    content: [
      'Your information may be processed outside of your country/region.',
      'We ensure that cross-border data transfers comply with applicable laws and regulations.',
      'Appropriate safeguards are in place to ensure data security.',
      'We comply with relevant privacy regulations such as GDPR and CCPA.',
    ],
  },
  {
    icon: Calendar,
    title: 'Data Retention',
    content: [
      'We retain your personal information only for as long as necessary.',
      'After account deletion, we will delete relevant data within a reasonable timeframe.',
      'Certain information may need to be retained for a longer period due to legal requirements.',
      'You can request the deletion of your personal information at any time.',
    ],
  },
]

const userRights = [
  {
    title: 'Access Rights',
    description:
      'You have the right to know what personal information we have collected about you.',
  },
  {
    title: 'Correction Rights',
    description:
      'You can request the correction of inaccurate or incomplete personal information.',
  },
  {
    title: 'Deletion Rights',
    description:
      'In certain circumstances, you can request the deletion of your personal information.',
  },
  {
    title: 'Restriction Rights',
    description:
      'You can request the restriction of processing your personal information.',
  },
  {
    title: 'Data Portability Rights',
    description:
      'You have the right to obtain your data in a structured, commonly used format.',
  },
  {
    title: 'Objection Rights',
    description:
      'You can object to the processing of your personal information based on legitimate interests.',
  },
]

function PrivacySection({ section }: { section: (typeof privacySections)[0] }) {
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
  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-white via-gray-50/90 to-blue-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Shield className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">隐私保护</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">隐私政策</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              我们重视并保护您的隐私。本政策说明我们如何收集、使用和保护您的个人信息
            </p>
            <div className="mt-8 text-sm text-blue-200">
              最后更新：2024年1月1日
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 bg-white/50 dark:bg-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                我们的承诺
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                AI SaaS
                Template致力于保护您的隐私和个人信息安全。我们遵循最高的隐私保护标准，确保您的数据得到妥善处理。
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
                您的权利
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                根据适用的隐私法律，您对自己的个人信息享有以下权利
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
              <h2 className="text-3xl font-bold mb-4">有隐私相关问题？</h2>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                如果您对我们的隐私政策有任何疑问，或希望行使您的隐私权利，请随时联系我们
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors">
                  联系我们
                </button>
                <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors">
                  数据请求
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
                政策更新
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300">
                我们可能会不时更新本隐私政策。重大变更时，我们会通过邮件或网站通知您。建议您定期查看本政策以了解最新信息。
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
