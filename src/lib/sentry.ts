/**
 * Sentry Error Tracking Integration
 *
 * Conditional Sentry integration that activates when SENTRY_DSN
 * environment variable is present. Provides initialization config
 * and helper utilities for error capture.
 *
 * Note: @sentry/nextjs package should be installed at deployment time.
 * This module provides the configuration and integration points.
 */

import { logger } from '@/lib/logger'

// Sentry configuration interface
export interface SentryConfig {
    dsn: string
    environment: string
    tracesSampleRate: number
    replaysSessionSampleRate: number
    replaysOnErrorSampleRate: number
    debug: boolean
}

/**
 * Check if Sentry is enabled (SENTRY_DSN is set)
 */
export function isSentryEnabled(): boolean {
    return !!(
        process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
    )
}

/**
 * Get Sentry DSN from environment
 */
export function getSentryDsn(): string | undefined {
    return process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
}

/**
 * Build Sentry configuration from environment variables
 */
export function buildSentryConfig(): SentryConfig | null {
    const dsn = getSentryDsn()
    if (!dsn) {
        return null
    }

    const isProd = process.env.NODE_ENV === 'production'

    return {
        dsn,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: isProd ? 0.1 : 1.0,
        replaysSessionSampleRate: isProd ? 0.1 : 0,
        replaysOnErrorSampleRate: 1.0,
        debug: !isProd,
    }
}

/**
 * Dynamically load the Sentry SDK.
 * Uses a variable to prevent Vite/bundler from statically analyzing the import.
 */
async function loadSentrySdk(): Promise<typeof import('@sentry/nextjs') | null> {
    try {
        // Use a variable to prevent static analysis by bundlers
        const sentryModule = '@sentry/nextjs'
        return await import(/* @vite-ignore */ sentryModule)
    } catch {
        return null
    }
}

/**
 * Initialize Sentry (call this in instrumentation.ts or app entry)
 *
 * Usage:
 * ```ts
 * import { initSentry } from '@/lib/sentry'
 * initSentry()
 * ```
 */
export async function initSentry(): Promise<void> {
    const config = buildSentryConfig()
    if (!config) {
        logger.debug('Sentry not configured: SENTRY_DSN not set')
        return
    }

    try {
        const Sentry = await loadSentrySdk()
        if (!Sentry) {
            logger.warn(
                'Sentry SDK (@sentry/nextjs) not installed. Skipping Sentry initialization.'
            )
            return
        }

        Sentry.init({
            dsn: config.dsn,
            environment: config.environment,
            tracesSampleRate: config.tracesSampleRate,
            debug: config.debug,
        })

        logger.info('Sentry initialized successfully', {
            category: 'sentry',
            action: 'init',
        })
    } catch (error) {
        logger.error(
            'Failed to initialize Sentry',
            error instanceof Error ? error : new Error(String(error))
        )
    }
}

/**
 * Capture an exception with Sentry (no-op if Sentry is not available)
 */
export async function captureException(
    error: Error,
    context?: Record<string, unknown>
): Promise<void> {
    if (!isSentryEnabled()) return

    try {
        const Sentry = await loadSentrySdk()
        if (Sentry) {
            Sentry.captureException(error, {
                extra: context,
            })
        }
    } catch {
        // Silently fail - we don't want Sentry errors to break the app
    }
}

/**
 * Capture a message with Sentry (no-op if Sentry is not available)
 */
export async function captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info'
): Promise<void> {
    if (!isSentryEnabled()) return

    try {
        const Sentry = await loadSentrySdk()
        if (Sentry) {
            Sentry.captureMessage(message, level)
        }
    } catch {
        // Silently fail
    }
}

/**
 * tRPC error handler integration for Sentry
 *
 * Usage in tRPC error formatter:
 * ```ts
 * import { getSentryEventId } from '@/lib/sentry'
 *
 * errorFormatter({ shape, error }) {
 *   return {
 *     ...shape,
 *     data: {
 *       ...shape.data,
 *       sentryEventId: getSentryEventId(),
 *     },
 *   }
 * }
 * ```
 */
export async function getSentryEventId(): Promise<string | undefined> {
    if (!isSentryEnabled()) return undefined

    try {
        const Sentry = await loadSentrySdk()
        if (Sentry) {
            return Sentry.lastEventId()
        }
    } catch {
        // Silently fail
    }
    return undefined
}
