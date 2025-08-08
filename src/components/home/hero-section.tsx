'use client'

import { Rocket, Sparkles, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function HeroSection() {
  const t = useTranslations('home.hero')

  return (
    <header className="hero-enhanced relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Dynamic background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
        <div
          className="absolute top-40 right-10 w-80 h-80 bg-purple-400/20 dark:bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400/20 dark:bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full filter blur-3xl animate-pulse" />
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/20 dark:from-gray-900/30 dark:via-transparent dark:to-gray-900/20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Tag */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10 mb-8">
            <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('badge')}
            </span>
          </div>

          {/* Main title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-gradient-improved">{t('title')}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            {t('subtitle')}
          </p>

          {/* Button group */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/auth/sign-up">
              <button className="btn-modern-primary text-lg px-10 py-4 w-full sm:w-auto min-w-[220px] group">
                <Rocket className="w-5 h-5 inline mr-3 group-hover:translate-x-1 transition-transform duration-300" />
                {t('startFree')}
              </button>
            </Link>
            <Link href="/pricing">
              <button className="glass-card-improved px-10 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 w-full sm:w-auto min-w-[220px] group">
                <Star className="w-5 h-5 inline mr-3 group-hover:rotate-12 transition-transform duration-300" />
                {t('viewPricing')}
              </button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 border-2 border-white dark:border-gray-900"
                  />
                ))}
              </div>
              <span>{t('trustedBy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span>{t('rating')}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
