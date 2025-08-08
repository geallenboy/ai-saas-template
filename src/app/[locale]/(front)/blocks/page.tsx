import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { categories } from '@/lib/blocks-registry'
import {
  ArrowRight,
  SearchIcon,
  ComponentIcon,
  PaletteIcon,
  CodeIcon,
  LayersIcon,
  Sparkles,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function BlocksPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blocks' })

  // Count the total number of components
  const totalComponents = categories.reduce(
    (sum, category) => sum + category.count,
    0
  )

  return (
    <div className="min-h-screen">
      {/* Hero Section - Use project standard style */}
      <header className="hero-enhanced relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Dynamic background element - consistent with the homepage */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
          <div
            className="absolute top-40 right-10 w-80 h-80 bg-purple-400/20 dark:bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-float"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-float"
            style={{ animationDelay: '2s' }}
          />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-emerald-400/10 rounded-full filter blur-3xl animate-pulse" />
        </div>

        {/* grid background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10" />

        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/20 dark:from-gray-900/30 dark:via-transparent dark:to-gray-900/20" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Tags */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10 mb-8">
              <ComponentIcon className="w-4 h-4 mr-2 text-emerald-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('beautifulComponents')}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              <span className="text-gradient-improved">{t('title')}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              {t('description')}
            </p>

            {/* Search Area */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 max-w-2xl mx-auto">
              <div className="relative flex-1 w-full">
                <Input
                  placeholder={t('searchPlaceholder')}
                  className="pl-12 pr-4 py-4 text-lg glass-card-improved w-full"
                />
                <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              </div>
              <Button
                size="lg"
                className="btn-modern-primary px-8 py-4 w-full sm:w-auto"
              >
                {t('search')}
              </Button>
            </div>

            {/* Statistics */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <ComponentIcon className="w-8 h-8 p-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-white border-2 border-white dark:border-gray-900" />
                  <LayersIcon className="w-8 h-8 p-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 text-white border-2 border-white dark:border-gray-900" />
                  <PaletteIcon className="w-8 h-8 p-1 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 text-white border-2 border-white dark:border-gray-900" />
                  <CodeIcon className="w-8 h-8 p-1 rounded-full bg-gradient-to-r from-pink-400 to-red-500 text-white border-2 border-white dark:border-gray-900" />
                </div>
                <span>
                  {totalComponents} {t('beautifulComponents')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Sparkles key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span>{t('responsive')}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Title */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('categoriesTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('categoriesDescription')}
            </p>
          </div>

          {/* Component Classification Grid - Using project standard card styles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const IconComponent = category.icon
              const isPopular = index === 0 // The first one is popular

              // Define gradient colors for each category
              const gradients = [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              ]
              const gradient = gradients[index % gradients.length]

              return (
                <div key={category.id} className="feature-card-enhanced group">
                  {/* Hover Background Effect */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl"
                    style={{ background: gradient }}
                  />

                  <div className="relative">
                    {/* Popular tags */}
                    {isPopular && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-2 py-1">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {t('popular')}
                        </Badge>
                      </div>
                    )}

                    {/* icon */}
                    <div
                      className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                      style={{ background: gradient }}
                    >
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>

                    {/* Classified information */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                        {category.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {category.count} {t('components')}
                      </Badge>
                    </div>

                    {/* View button */}
                    <Button
                      asChild
                      className="w-full gap-2 transition-all group-hover:gap-3 mt-4"
                    >
                      <Link href={`/${locale}/blocks/${category.id}`}>
                        {t('viewComponents')}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>

                    {/* decorative elements */}
                    <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card-improved p-8 md:p-12 text-center">
            <div className="mx-auto max-w-2xl">
              <ComponentIcon className="mx-auto mb-6 h-12 w-12 text-blue-600" />
              <h3 className="mb-4 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {t('startUsing')}
              </h3>
              <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
                {t('startUsingDescription')}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" className="btn-modern-primary" asChild>
                  <Link href={`/${locale}/docs`}>{t('viewDocumentation')}</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-card-improved"
                  asChild
                >
                  <Link href="https://github.com" target="_blank">
                    {t('githubRepository')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
