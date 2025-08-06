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

  // Image optimization configuration
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // External package configuration (moved from experimental)
  serverExternalPackages: ['sharp'],

  // Turbopack configuration (moved from experimental.turbo)
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
    // Package import optimization
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@tabler/icons-react',
      'lucide-react',
      'framer-motion',
      'date-fns',
    ],
    // Enable PPR (Partial Prerendering) - temporarily disabled
    // ppr: process.env.NODE_ENV === 'production',
  },

  // Webpack optimization configuration
  webpack: (config, { dev, isServer, webpack }) => {
    // Production environment optimization
    if (!(dev || isServer)) {
      // Code splitting optimization
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000, // 244KB
        cacheGroups: {
          // Framework code
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'framework',
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // UI Component library
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
          // Tool library
          utils: {
            test: /[\\/]node_modules[\\/](date-fns|clsx|class-variance-authority)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 20,
          },
          // Other third-party libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // public code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      }

      // enable Tree Shaking
      config.optimization.usedExports = true
      config.optimization.sideEffects = false

      // Compression optimization
      config.optimization.minimize = true
    }

    // Bundle analyze
    if (process.env.ANALYZE === 'true') {
      const BundleAnalyzerPlugin = require('@next/bundle-analyzer')({
        enabled: true,
        openAnalyzer: false,
      })
      config.plugins.push(BundleAnalyzerPlugin)
    }

    // Performance monitoring
    if (!dev) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.ENABLE_PERFORMANCE_MONITORING': JSON.stringify('true'),
        })
      )
    }

    return config
  },

  // Cache configuration
  onDemandEntries: {
    maxInactiveAge: 25 * 1000, // 25 seconds
    pagesBufferLength: 2,
  },

  // Security and performance headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        // Security headers
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
        // performance header
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
      ],
    },
    // Static resource cache
    {
      source: '/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    // Image cache
    {
      source: '/_next/image(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    // API cache
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

  // Redirect optimization
  redirects: async () => [],

  // Rewrite optimization
  rewrites: async () => [],
}

const withMDX = createMDX()
export default withNextIntl(withMDX(config))
