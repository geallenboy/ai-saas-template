'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertCircle,
  CheckCircle,
  Globe,
  Search,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface SEOMetrics {
  title: {
    length: number
    score: 'good' | 'warning' | 'error'
    recommendations: string[]
  }
  description: {
    length: number
    score: 'good' | 'warning' | 'error'
    recommendations: string[]
  }
  headings: {
    h1Count: number
    structure: boolean
    score: 'good' | 'warning' | 'error'
    recommendations: string[]
  }
  images: {
    total: number
    withAlt: number
    score: 'good' | 'warning' | 'error'
    recommendations: string[]
  }
  performance: {
    score: number
    recommendations: string[]
  }
  structuredData: {
    present: boolean
    types: string[]
    score: 'good' | 'warning' | 'error'
    recommendations: string[]
  }
}

export function SEOReport() {
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const analyzePage = () => {
      // Analyze the SEO metrics of the current page
      const title = document.title
      const metaDescription =
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute('content') || ''
      const h1Elements = document.querySelectorAll('h1')
      const images = document.querySelectorAll('img')
      const structuredDataScripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      )

      // Analyze the title
      const titleAnalysis = {
        length: title.length,
        score:
          title.length >= 30 && title.length <= 60
            ? ('good' as const)
            : title.length >= 20 && title.length <= 70
              ? ('warning' as const)
              : ('error' as const),
        recommendations:
          title.length < 30
            ? ['The title is too short, 30-60 characters is recommended']
            : title.length > 60
              ? ['The title is too long, 30-60 characters is recommended']
              : ['The title length is appropriate'],
      }

      // Analyze the description
      const descriptionAnalysis = {
        length: metaDescription.length,
        score:
          metaDescription.length >= 120 && metaDescription.length <= 160
            ? ('good' as const)
            : metaDescription.length >= 100 && metaDescription.length <= 180
              ? ('warning' as const)
              : ('error' as const),
        recommendations:
          metaDescription.length < 120
            ? [
                'The description is too short, 120-160 characters is recommended',
              ]
            : metaDescription.length > 160
              ? [
                  'The description is too long, 120-160 characters is recommended',
                ]
              : ['The description length is appropriate'],
      }

      // Analyze the headings structure
      const headingsAnalysis = {
        h1Count: h1Elements.length,
        structure: h1Elements.length === 1,
        score:
          h1Elements.length === 1 ? ('good' as const) : ('warning' as const),
        recommendations:
          h1Elements.length === 0
            ? ['Missing H1 title']
            : h1Elements.length > 1
              ? [
                  'There are multiple H1 titles on the page, it is recommended to keep only one',
                ]
              : ['H1 title structure is good'],
      }

      // Analyze the images
      const imagesWithAlt = Array.from(images).filter(img =>
        img.getAttribute('alt')
      )
      const imageAnalysis = {
        total: images.length,
        withAlt: imagesWithAlt.length,
        score:
          images.length === 0
            ? ('good' as const)
            : imagesWithAlt.length / images.length >= 0.9
              ? ('good' as const)
              : imagesWithAlt.length / images.length >= 0.7
                ? ('warning' as const)
                : ('error' as const),
        recommendations:
          images.length === 0
            ? ['No images on the page']
            : imagesWithAlt.length === images.length
              ? ['All images have alt tags']
              : [
                  `${images.length - imagesWithAlt.length} images are missing alt tags`,
                ],
      }

      // Analyze structured data
      const structuredTypes = Array.from(structuredDataScripts).map(script => {
        try {
          const data = JSON.parse(script.textContent || '{}')
          return data['@type'] || 'Unknown'
        } catch {
          return 'Invalid'
        }
      })

      const structuredDataAnalysis = {
        present: structuredDataScripts.length > 0,
        types: structuredTypes,
        score:
          structuredDataScripts.length > 0
            ? ('good' as const)
            : ('warning' as const),
        recommendations:
          structuredDataScripts.length === 0
            ? ['Recommend adding structured data']
            : [
                `Found ${structuredTypes.length} structured data: ${structuredTypes.join(', ')}`,
              ],
      }

      setMetrics({
        title: titleAnalysis,
        description: descriptionAnalysis,
        headings: headingsAnalysis,
        images: imageAnalysis,
        performance: {
          score: 85, // Simulated performance score
          recommendations: [
            'Enable compression',
            'Optimize images',
            'Reduce JavaScript bundle size',
          ],
        },
        structuredData: structuredDataAnalysis,
      })

      setLoading(false)
    }

    // Latency analysis ensures pages are fully loaded
    setTimeout(analyzePage, 1000)
  }, [])

  const getScoreIcon = (score: 'good' | 'warning' | 'error') => {
    switch (score) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getScoreColor = (score: 'good' | 'warning' | 'error') => {
    switch (score) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  if (loading || !metrics) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO 分析报告
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <span className="ml-2">分析页面SEO状况...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const overallScore = [
    metrics.title.score,
    metrics.description.score,
    metrics.headings.score,
    metrics.images.score,
    metrics.structuredData.score,
  ].filter(score => score === 'good').length

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            SEO 总体评分
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {Math.round((overallScore / 5) * 100)}分
              </div>
              <div className="text-sm text-gray-600">
                {overallScore}/5 项指标通过
              </div>
            </div>
            <div className="text-right">
              <Badge
                variant="outline"
                className={getScoreColor(
                  overallScore >= 4
                    ? 'good'
                    : overallScore >= 2
                      ? 'warning'
                      : 'error'
                )}
              >
                {overallScore >= 4
                  ? '优秀'
                  : overallScore >= 2
                    ? '良好'
                    : '需要改进'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Page title */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getScoreIcon(metrics.title.score)}
              页面标题
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">长度: {metrics.title.length} 字符</p>
              <div className="space-y-1">
                {metrics.title.recommendations.map((rec, index) => (
                  <p key={index} className="text-xs text-gray-600">
                    • {rec}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meta description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getScoreIcon(metrics.description.score)}
              Meta description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">长度: {metrics.description.length} 字符</p>
              <div className="space-y-1">
                {metrics.description.recommendations.map((rec, index) => (
                  <p key={index} className="text-xs text-gray-600">
                    • {rec}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* title structure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getScoreIcon(metrics.headings.score)}
              Title Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">H1 Count: {metrics.headings.h1Count}</p>
              <div className="space-y-1">
                {metrics.headings.recommendations.map((rec, index) => (
                  <p key={index} className="text-xs text-gray-600">
                    • {rec}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 图片优化 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getScoreIcon(metrics.images.score)}
              Image Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                Alt tag coverage: {metrics.images.withAlt}/
                {metrics.images.total}
                {metrics.images.total > 0 &&
                  ` (${Math.round((metrics.images.withAlt / metrics.images.total) * 100)}%)`}
              </p>
              <div className="space-y-1">
                {metrics.images.recommendations.map((rec, index) => (
                  <p key={index} className="text-xs text-gray-600">
                    • {rec}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* structured data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getScoreIcon(metrics.structuredData.score)}
              Structured Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                数据类型:{' '}
                {metrics.structuredData.types.length > 0
                  ? metrics.structuredData.types.join(', ')
                  : '无'}
              </p>
              <div className="space-y-1">
                {metrics.structuredData.recommendations.map((rec, index) => (
                  <p key={index} className="text-xs text-gray-600">
                    • {rec}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                性能评分: {metrics.performance.score}/100
              </p>
              <div className="space-y-1">
                {metrics.performance.recommendations.map((rec, index) => (
                  <p key={index} className="text-xs text-gray-600">
                    • {rec}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reanalyze
            </Button>
            <Button
              onClick={() =>
                window.open(
                  `https://developers.google.com/speed/pagespeed/insights/?url=${encodeURIComponent(window.location.href)}`,
                  '_blank'
                )
              }
            >
              <Globe className="h-4 w-4 mr-2" />
              Google PageSpeed 测试
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
