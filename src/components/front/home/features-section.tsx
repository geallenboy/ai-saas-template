'use client'

import { Globe, Palette, Rocket, Shield, Sparkles, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type React from 'react'

// 现代功能卡片组件
function ModernFeature({
  icon: Icon,
  title,
  description,
  gradient,
}: {
  icon: React.ElementType
  title: string
  description: string
  gradient: string
}) {
  return (
    <div className="feature-card-enhanced group">
      <div
        className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl"
        style={{ background: gradient }}
      />
      <div className="relative">
        <div
          className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300"
          style={{ background: gradient }}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {description}
        </p>

        {/* 装饰性元素 */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  )
}

export default function FeaturesSection() {
  const t = useTranslations('home.features')

  const features = [
    {
      icon: Rocket,
      title: t('quickStart.title'),
      description: t('quickStart.description'),
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      icon: Zap,
      title: t('aiIntegration.title'),
      description: t('aiIntegration.description'),
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      icon: Shield,
      title: t('secureAuth.title'),
      description: t('secureAuth.description'),
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      icon: Palette,
      title: t('modernUI.title'),
      description: t('modernUI.description'),
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
    {
      icon: Globe,
      title: t('multiLanguage.title'),
      description: t('multiLanguage.description'),
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
    {
      icon: Sparkles,
      title: t('paymentIntegration.title'),
      description: t('paymentIntegration.description'),
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
  ]

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题区域 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* 功能网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <ModernFeature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
