import { createMDX } from 'fumadocs-mdx/next'
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import './src/env'

const withNextIntl = createNextIntlPlugin('./src/translate/i18n/request.ts')

const config: NextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  output: 'standalone',

  // 跳过构建错误继续构建
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // 图片优化配置
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30天缓存
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 外部包配置 (moved from experimental)
  serverExternalPackages: ['sharp'],

  // Turbopack 配置 (moved from experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // 包导入优化
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@tabler/icons-react',
      'lucide-react',
      'framer-motion',
      'date-fns',
    ],
    // 启用 PPR (Partial Prerendering) - 暂时禁用
    // ppr: process.env.NODE_ENV === 'production',
  },

  // Webpack 优化配置
  webpack: (config, { dev, isServer, webpack }) => {
    // 生产环境优化
    if (!(dev || isServer)) {
      // 代码分割优化
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000, // 244KB
        cacheGroups: {
          // 框架代码
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'framework',
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // UI 组件库
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|@tabler|lucide-react)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 30,
          },
          // AI SDK
          ai: {
            test: /[\\/]node_modules[\\/]@ai-sdk[\\/]/,
            name: 'ai-sdk',
            chunks: 'all',
            priority: 25,
          },
          // 工具库
          utils: {
            test: /[\\/]node_modules[\\/](date-fns|clsx|class-variance-authority)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 20,
          },
          // 其他第三方库
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // 公共代码
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      }

      // 启用 Tree Shaking
      config.optimization.usedExports = true
      config.optimization.sideEffects = false

      // 压缩优化
      config.optimization.minimize = true
    }

    // Bundle 分析
    if (process.env.ANALYZE === 'true') {
      const BundleAnalyzerPlugin = require('@next/bundle-analyzer')({
        enabled: true,
        openAnalyzer: false,
      })
      config.plugins.push(BundleAnalyzerPlugin)
    }

    // 性能监控
    if (!dev) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.ENABLE_PERFORMANCE_MONITORING': JSON.stringify('true'),
        })
      )
    }

    return config
  },

  // 缓存配置
  onDemandEntries: {
    maxInactiveAge: 25 * 1000, // 25秒
    pagesBufferLength: 2,
  },

  // 安全和性能头部
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        // 安全头部
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        // 性能头部
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        // Google OAuth 相关安全头部
        {
          key: 'Cross-Origin-Embedder-Policy',
          value: 'unsafe-none',
        },
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin-allow-popups',
        },
      ],
    },
    // 静态资源缓存
    {
      source: '/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    // 图片缓存
    {
      source: '/_next/image(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    // API 缓存
    {
      source: '/api/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=60, stale-while-revalidate=300',
        },
      ],
    },
  ],

  // 重定向优化
  redirects: async () => [],

  // 重写优化
  rewrites: async () => [],
}

const withMDX = createMDX()
export default withNextIntl(withMDX(config))
