import { ServerComponentPreview } from '@/components/preview/server-component-preview'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCategoryById, getComponentsByCategory } from '@/lib/blocks-registry'
import {
  ArrowLeft,
  ExternalLink,
  SearchIcon,
  CopyIcon,
  DownloadIcon,
  StarIcon,
  ComponentIcon,
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface BlocksCategoryPageProps {
  params: Promise<{
    locale: string
    category: string
  }>
}

export default async function BlocksCategoryPage({
  params,
}: BlocksCategoryPageProps) {
  const { locale, category: categoryId } = await params
  const category = getCategoryById(categoryId)
  const components = getComponentsByCategory(categoryId)

  if (!category) {
    notFound()
  }

  if (components.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link
                href={`/${locale}/blocks`}
                className="gap-2 hover:gap-3 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                {locale === 'de'
                  ? 'Zurück zu Komponenten'
                  : 'Back to Components'}
              </Link>
            </Button>
          </div>

          <div className="py-20 text-center">
            <div className="mx-auto max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <ComponentIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h1 className="mb-4 font-bold text-3xl text-gray-900 dark:text-white">
                {category.name}
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                {locale === 'de'
                  ? 'In dieser Kategorie sind noch keine Komponenten vorhanden. Bleiben Sie dran!'
                  : 'No components in this category yet. Stay tuned!'}
              </p>
              <Button asChild className="btn-modern-primary">
                <Link href={`/${locale}/blocks`}>
                  {locale === 'de'
                    ? 'Durchsuchen Sie andere Kategorien'
                    : 'Browse Other Categories'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const IconComponent = category.icon

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Section */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link
                href={`/${locale}/blocks`}
                className="gap-2 hover:gap-3 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                {locale === 'de'
                  ? 'Zurück zu Komponenten'
                  : 'Back to Components'}
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <IconComponent className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="font-bold text-4xl mb-3 text-gray-900 dark:text-white">
                  {category.name}
                </h1>
                <p className="text-muted-foreground text-lg mb-4 leading-relaxed">
                  {category.description}
                </p>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {components.length}{' '}
                    {locale === 'de' ? 'Komponenten' : 'components'}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm px-3 py-1">
                    <StarIcon className="h-3 w-3 mr-1" />
                    {locale === 'de' ? 'Ausgewählt' : 'Featured'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Search and operate */}
            <div className="flex flex-col gap-4 sm:flex-row lg:w-auto">
              <div className="relative">
                <Input
                  placeholder={
                    locale === 'de'
                      ? 'Suche Komponenten...'
                      : 'Search components...'
                  }
                  className="w-full sm:w-64 pl-10 glass-card-improved"
                />
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <Button variant="outline" className="gap-2 glass-card-improved">
                <DownloadIcon className="h-4 w-4" />
                {locale === 'de' ? 'Alle herunterladen' : 'Download All'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Component Display */}
        <div className="space-y-12">
          {components.map((component, index) => (
            <Card
              key={component.id}
              className="feature-card-enhanced overflow-hidden"
            >
              <CardHeader className="bg-muted/30 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <CardTitle className="text-2xl text-gray-900 dark:text-white">
                        {component.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        #{index + 1}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {component.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 glass-card-improved"
                    >
                      <CopyIcon className="h-4 w-4" />
                      {locale === 'de' ? 'Code kopieren' : 'Copy Code'}
                    </Button>
                    {component.preview && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="glass-card-improved"
                      >
                        <Link
                          href={component.preview}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {locale === 'de' ? 'Live-Vorschau' : 'Live Preview'}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <ServerComponentPreview
                  componentId={component.id}
                  code={component.code}
                  name={component.name}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Related recommendations */}
        <section className="mt-20">
          <Card className="feature-card-enhanced">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="mx-auto max-w-2xl">
                <ComponentIcon className="mx-auto mb-6 h-12 w-12 text-blue-600" />
                <h3 className="mb-4 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {locale === 'de'
                    ? 'Brauchen Sie mehr Komponenten?'
                    : 'Need More Components?'}
                </h3>
                <p className="mb-8 text-lg text-muted-foreground">
                  {locale === 'de'
                    ? 'Durchsuchen Sie andere Kategorien, um weitere schöne Komponenten zu entdecken'
                    : 'Explore other categories to discover more beautiful components'}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Button size="lg" className="btn-modern-primary" asChild>
                    <Link href={`/${locale}/blocks`}>
                      {locale === 'de'
                        ? 'Alle Kategorien durchsuchen'
                        : 'Browse All Categories'}
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="glass-card-improved"
                    asChild
                  >
                    <Link href={`/${locale}/docs`}>
                      {locale === 'de'
                        ? 'Dokumentation anzeigen'
                        : 'View Documentation'}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
