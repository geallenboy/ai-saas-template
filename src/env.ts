import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  // 在构建时跳过验证，因为环境变量在运行时才可用
  skipValidation:
    process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL,
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    // Database (必需)
    DATABASE_URL: z.string().url(),

    // Stripe (必需)
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),

    // AI API Keys (至少需要一个)
    OPENAI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
    XAI_API_KEY: z.string().optional(),

    // Redis (用于缓存和限流)
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // Email Service (用于通知)
    RESEND_API_KEY: z.string().optional(),

    // Cloudflare (optional)
    CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
    CLOUDFLARE_API_TOKEN: z.string().optional(),

    // External Services
    SENTRY_DSN: z.string().optional(),
    SLACK_WEBHOOK_URL: z.string().optional(),

    // Google OAuth
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    // Better Auth
    BETTER_AUTH_SECRET: z
      .string()
      .min(32)
      .default('your-secret-key-change-in-production-min-32-chars'),
    BETTER_AUTH_URL: z.string().url().optional(),

    // Admin configuration
    ADMIN_EMAILS: z.string().optional(),

    // Feature Flags
    ENABLE_AI_FEATURES: z
      .string()
      .default('true')
      .transform(val => val === 'true'),
    ENABLE_PAYMENT_FEATURES: z
      .string()
      .default('true')
      .transform(val => val === 'true'),
    ENABLE_ADMIN_FEATURES: z
      .string()
      .default('true')
      .transform(val => val === 'true'),

    // Node environment
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    // Database connection pool settings
    DB_POOL_MAX: z.string().default('20').transform(Number),
    DB_POOL_MIN: z.string().default('5').transform(Number),
  },

  /*
   * Environment variables available on the client (and server).
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    // Auth URLs
    NEXT_PUBLIC_SIGN_IN_URL: z.string().default('/auth/login'),
    NEXT_PUBLIC_SIGN_UP_URL: z.string().default('/auth/register'),
    NEXT_PUBLIC_SIGN_IN_FALLBACK_REDIRECT_URL: z.string().default('/'),
    NEXT_PUBLIC_SIGN_UP_FALLBACK_REDIRECT_URL: z.string().default('/'),

    // Site configuration (必需)
    NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),

    // Stripe (必需)
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),

    // Feature flags (客户端)
    NEXT_PUBLIC_ENABLE_AI_FEATURES: z.string().default('true'),
    NEXT_PUBLIC_ENABLE_PAYMENT_FEATURES: z.string().default('true'),
    NEXT_PUBLIC_DEFAULT_LOCALE: z.string().default('zh'),
    NEXT_PUBLIC_SUPPORTED_LOCALES: z.string().default('zh,en'),

    // Analytics
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),

    // Sentry (客户端监控)
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

    // Google OAuth (客户端)
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  },

  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    XAI_API_KEY: process.env.XAI_API_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,

    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    ENABLE_AI_FEATURES: process.env.ENABLE_AI_FEATURES,
    ENABLE_PAYMENT_FEATURES: process.env.ENABLE_PAYMENT_FEATURES,
    ENABLE_ADMIN_FEATURES: process.env.ENABLE_ADMIN_FEATURES,
    NODE_ENV: process.env.NODE_ENV,
    DB_POOL_MAX: process.env.DB_POOL_MAX,
    DB_POOL_MIN: process.env.DB_POOL_MIN,

    // Client
    NEXT_PUBLIC_SIGN_IN_URL: process.env.NEXT_PUBLIC_SIGN_IN_URL,
    NEXT_PUBLIC_SIGN_UP_URL: process.env.NEXT_PUBLIC_SIGN_UP_URL,
    NEXT_PUBLIC_SIGN_IN_FALLBACK_REDIRECT_URL:
      process.env.NEXT_PUBLIC_SIGN_IN_FALLBACK_REDIRECT_URL,
    NEXT_PUBLIC_SIGN_UP_FALLBACK_REDIRECT_URL:
      process.env.NEXT_PUBLIC_SIGN_UP_FALLBACK_REDIRECT_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_ENABLE_AI_FEATURES: process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES,
    NEXT_PUBLIC_ENABLE_PAYMENT_FEATURES:
      process.env.NEXT_PUBLIC_ENABLE_PAYMENT_FEATURES,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_SUPPORTED_LOCALES: process.env.NEXT_PUBLIC_SUPPORTED_LOCALES,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  },

  /*
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
})

// Client-safe environment checks
export const isDev = process.env.NODE_ENV === 'development'
export const isProd = process.env.NODE_ENV === 'production'
export const isTest = process.env.NODE_ENV === 'test'

// Helper function to get site URL (client-safe)
export const getSiteUrl = () => {
  return (
    env.NEXT_PUBLIC_SITE_URL ||
    env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'
  )
}

// Server-side only helpers
export const getServerEnv = () => {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() can only be called on the server side')
  }
  return env
}

// Helper function to check if Stripe is configured
export const isStripeConfigured = () => {
  if (typeof window !== 'undefined') {
    // Client-side check
    return !!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  }
  // Server-side check
  return !!(env.STRIPE_SECRET_KEY && env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

// Helper function to check if Redis is configured
export const isRedisConfigured = () => {
  if (typeof window !== 'undefined') {
    return false // Redis is server-side only
  }
  return !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN)
}

// Helper function to check if AI services are configured
export const isAIConfigured = () => {
  if (typeof window !== 'undefined') {
    return env.NEXT_PUBLIC_ENABLE_AI_FEATURES === 'true'
  }
  return (
    env.ENABLE_AI_FEATURES &&
    (env.OPENAI_API_KEY ||
      env.ANTHROPIC_API_KEY ||
      env.GOOGLE_GENERATIVE_AI_API_KEY ||
      env.XAI_API_KEY)
  )
}

// Helper function to check if email service is configured
export const isEmailConfigured = () => {
  if (typeof window !== 'undefined') {
    return false // Email is server-side only
  }
  return !!env.RESEND_API_KEY
}

// Helper function to check if Google OAuth is configured
export const isGoogleOAuthConfigured = () => {
  if (typeof window !== 'undefined') {
    // Client-side check
    return !!env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  }
  // Server-side check
  return !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
}

// Feature flag helpers
export const getFeatureFlags = () => {
  if (typeof window !== 'undefined') {
    // Client-side
    return {
      aiFeatures: env.NEXT_PUBLIC_ENABLE_AI_FEATURES === 'true',
      paymentFeatures: env.NEXT_PUBLIC_ENABLE_PAYMENT_FEATURES === 'true',
      adminFeatures: true, // Admin features are server-side only
    }
  }
  // Server-side
  return {
    aiFeatures: env.ENABLE_AI_FEATURES,
    paymentFeatures: env.ENABLE_PAYMENT_FEATURES,
    adminFeatures: env.ENABLE_ADMIN_FEATURES,
  }
}

// Supported locales helper
export const getSupportedLocales = () => {
  return env.NEXT_PUBLIC_SUPPORTED_LOCALES.split(',').map(locale =>
    locale.trim()
  )
}

// Default locale helper
export const getDefaultLocale = () => {
  return env.NEXT_PUBLIC_DEFAULT_LOCALE
}
