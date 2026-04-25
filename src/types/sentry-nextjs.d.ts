/**
 * Type declarations for @sentry/nextjs
 *
 * This module is dynamically imported and may not be installed.
 * These declarations provide type safety for the integration points.
 */
declare module '@sentry/nextjs' {
    interface SentryInitOptions {
        dsn: string
        environment?: string
        tracesSampleRate?: number
        replaysSessionSampleRate?: number
        replaysOnErrorSampleRate?: number
        debug?: boolean
    }

    export function init(options: SentryInitOptions): void
    export function captureException(
        error: Error,
        context?: { extra?: Record<string, unknown> }
    ): string
    export function captureMessage(
        message: string,
        level?: 'info' | 'warning' | 'error'
    ): string
    export function lastEventId(): string | undefined
}
