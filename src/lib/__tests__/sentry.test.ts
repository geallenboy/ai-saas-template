import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock logger to avoid env validation chain
vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}))

import {
    buildSentryConfig,
    getSentryDsn,
    isSentryEnabled,
} from '@/lib/sentry'

describe('Sentry Integration', () => {
    const originalEnv = process.env

    beforeEach(() => {
        process.env = { ...originalEnv }
    })

    afterEach(() => {
        process.env = originalEnv
    })

    describe('isSentryEnabled', () => {
        it('should return false when no DSN is set', () => {
            process.env.SENTRY_DSN = undefined
            process.env.NEXT_PUBLIC_SENTRY_DSN = undefined
            expect(isSentryEnabled()).toBe(false)
        })

        it('should return true when SENTRY_DSN is set', () => {
            process.env.SENTRY_DSN = 'https://example@sentry.io/123'
            expect(isSentryEnabled()).toBe(true)
        })

        it('should return true when NEXT_PUBLIC_SENTRY_DSN is set', () => {
            process.env.SENTRY_DSN = undefined
            process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://example@sentry.io/456'
            expect(isSentryEnabled()).toBe(true)
        })
    })

    describe('getSentryDsn', () => {
        it('should return undefined when no DSN is set', () => {
            process.env.SENTRY_DSN = undefined
            process.env.NEXT_PUBLIC_SENTRY_DSN = undefined
            expect(getSentryDsn()).toBeUndefined()
        })

        it('should prefer SENTRY_DSN over NEXT_PUBLIC_SENTRY_DSN', () => {
            process.env.SENTRY_DSN = 'https://server@sentry.io/1'
            process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://client@sentry.io/2'
            expect(getSentryDsn()).toBe('https://server@sentry.io/1')
        })

        it('should fall back to NEXT_PUBLIC_SENTRY_DSN', () => {
            process.env.SENTRY_DSN = undefined
            process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://client@sentry.io/2'
            expect(getSentryDsn()).toBe('https://client@sentry.io/2')
        })
    })

    describe('buildSentryConfig', () => {
        it('should return null when no DSN is set', () => {
            process.env.SENTRY_DSN = undefined
            process.env.NEXT_PUBLIC_SENTRY_DSN = undefined
            expect(buildSentryConfig()).toBeNull()
        })

        it('should return config with DSN when SENTRY_DSN is set', () => {
            process.env.SENTRY_DSN = 'https://example@sentry.io/123'
            const config = buildSentryConfig()
            expect(config).not.toBeNull()
            expect(config?.dsn).toBe('https://example@sentry.io/123')
            expect(config?.environment).toBeDefined()
        })

        it('should set replaysOnErrorSampleRate to 1.0', () => {
            process.env.SENTRY_DSN = 'https://example@sentry.io/123'
            const config = buildSentryConfig()
            expect(config).not.toBeNull()
            expect(config?.replaysOnErrorSampleRate).toBe(1.0)
        })

        it('should use non-production defaults in test environment', () => {
            process.env.SENTRY_DSN = 'https://example@sentry.io/123'
            // In vitest, NODE_ENV is 'test' which is non-production
            const config = buildSentryConfig()
            expect(config).not.toBeNull()
            expect(config?.tracesSampleRate).toBe(1.0)
            expect(config?.debug).toBe(true)
        })
    })
})
