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
  title: '隐私政策 - AI SaaS Template',
  description:
    '了解AI SaaS Template如何收集、使用和保护您的个人信息。我们致力于保护您的隐私权。',
}

const privacySections = [
  {
    icon: Database,
    title: '信息收集',
    content: [
      '我们收集您主动提供的信息，如注册账户时的姓名、邮箱地址等',
      '自动收集的技术信息，包括IP地址、浏览器类型、设备信息等',
      '使用分析数据，帮助我们改进服务质量',
      'Cookie和类似技术收集的信息',
    ],
  },
  {
    icon: Eye,
    title: '信息使用',
    content: [
      '提供、维护和改进我们的服务',
      '处理交易和发送相关通知',
      '回应您的询问和提供客户支持',
      '发送重要更新和营销信息（您可以选择退订）',
      '防止欺诈和确保服务安全',
    ],
  },
  {
    icon: Users,
    title: '信息共享',
    content: [
      '我们不会出售您的个人信息给第三方',
      '可能与服务提供商共享必要信息以提供服务',
      '在法律要求或保护权利时可能披露信息',
      '业务转让时信息可能作为资产的一部分转移',
    ],
  },
  {
    icon: Lock,
    title: '数据安全',
    content: [
      '使用行业标准的加密技术保护数据传输',
      '实施严格的访问控制和身份验证措施',
      '定期进行安全审计和漏洞评估',
      '员工接受隐私和安全培训',
      '数据备份和灾难恢复计划',
    ],
  },
  {
    icon: Globe,
    title: '国际传输',
    content: [
      '您的信息可能在您所在国家/地区以外处理',
      '我们确保跨境数据传输符合适用的法律法规',
      '采用适当的保护措施确保数据安全',
      '遵守GDPR、CCPA等相关隐私法规',
    ],
  },
  {
    icon: Calendar,
    title: '数据保留',
    content: [
      '我们仅在必要期间保留您的个人信息',
      '账户删除后，我们会在合理时间内删除相关数据',
      '某些信息可能因法律要求需要保留更长时间',
      '您可以随时请求删除您的个人信息',
    ],
  },
]

const userRights = [
  {
    title: '访问权',
    description: '您有权了解我们收集了您的哪些个人信息',
  },
  {
    title: '更正权',
    description: '您可以要求更正不准确或不完整的个人信息',
  },
  {
    title: '删除权',
    description: '在某些情况下，您可以要求删除您的个人信息',
  },
  {
    title: '限制处理权',
    description: '您可以要求限制对您个人信息的处理',
  },
  {
    title: '数据可携权',
    description: '您有权以结构化、常用格式获取您的数据',
  },
  {
    title: '反对权',
    description: '您可以反对基于合法利益的数据处理',
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
          <li key={`item-${index}`} className="flex items-start gap-3">
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
            最后更新：2025年8月6日
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
              <PrivacySection key={`item-${index}`} section={section} />
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
                key={`item-${index}`}
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
              <button
                type="button"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                联系我们
              </button>
              <button
                type="button"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
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
  )
}
