import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { _internals, type LogContext, logger } from '@/lib/logger'

const { buildLogEntry, formatDevLog, shouldLog } = _internals

describe('Structured Logger', () => {
    describe('buildLogEntry', () => {
        it('should build a log entry with timestamp, level, and message', () => {
            const entry = buildLogEntry('info', 'test message')
            expect(entry.timestamp).toBeDefined()
            expect(entry.level).toBe('info')
            expect(entry.message).toBe('test message')
        })

        it('should include error details when error is provided', () => {
            const error = new Error('something went wrong')
            const entry = buildLogEntry('error', 'failure', error)
            expect(entry.error).toBeDefined()
            expect(entry.error?.name).toBe('Error')
            expect(entry.error?.message).toBe('something went wrong')
            expect(entry.error?.stack).toBeDefined()
        })

        it('should include context fields in the entry', () => {
            const context: LogContext = {
                userId: 'user-123',
                category: 'auth',
                duration: 42,
            }
            const entry = buildLogEntry('info', 'test', null, context)
            expect(entry.userId).toBe('user-123')
            expect(entry.category).toBe('auth')
            expect(entry.duration).toBe(42)
        })

        it('should not include undefined context values', () => {
            const context: LogContext = {
                userId: 'user-123',
                category: undefined,
            }
            const entry = buildLogEntry('info', 'test', null, context)
            expect(entry.userId).toBe('user-123')
            expect('category' in entry).toBe(false)
        })

        it('should produce valid JSON when stringified', () => {
            const context: LogContext = {
                userId: 'user-123',
                requestId: 'req-456',
                duration: 150,
            }
            const entry = buildLogEntry('warn', 'slow request', null, context)
            const json = JSON.stringify(entry)
            const parsed = JSON.parse(json)
            expect(parsed.level).toBe('warn')
            expect(parsed.message).toBe('slow request')
            expect(parsed.timestamp).toBeDefined()
            expect(parsed.userId).toBe('user-123')
        })
    })

    describe('formatDevLog', () => {
        it('should format a readable log line for development', () => {
            const entry = buildLogEntry('info', 'hello world')
            const output = formatDevLog(entry)
            expect(output).toContain('[INFO]')
            expect(output).toContain('hello world')
        })

        it('should include context in dev format', () => {
            const entry = buildLogEntry('warn', 'slow', null, { duration: 500 })
            const output = formatDevLog(entry)
            expect(output).toContain('[WARN]')
            expect(output).toContain('slow')
            expect(output).toContain('500')
        })

        it('should include error info in dev format', () => {
            const error = new Error('boom')
            const entry = buildLogEntry('error', 'failed', error)
            const output = formatDevLog(entry)
            expect(output).toContain('[ERROR]')
            expect(output).toContain('Error: boom')
        })
    })

    describe('logger methods', () => {
        let consoleSpy: {
            log: ReturnType<typeof vi.spyOn>
            error: ReturnType<typeof vi.spyOn>
            warn: ReturnType<typeof vi.spyOn>
            debug: ReturnType<typeof vi.spyOn>
        }

        beforeEach(() => {
            consoleSpy = {
                log: vi.spyOn(console, 'log').mockImplementation(() => { }),
                error: vi.spyOn(console, 'error').mockImplementation(() => { }),
                warn: vi.spyOn(console, 'warn').mockImplementation(() => { }),
                debug: vi.spyOn(console, 'debug').mockImplementation(() => { }),
            }
        })

        afterEach(() => {
            vi.restoreAllMocks()
        })

        it('logger.info should call console.log', () => {
            logger.info('test info')
            expect(consoleSpy.log).toHaveBeenCalled()
        })

        it('logger.error should call console.error', () => {
            logger.error('test error', new Error('err'))
            expect(consoleSpy.error).toHaveBeenCalled()
        })

        it('logger.warn should call console.warn', () => {
            logger.warn('test warn')
            expect(consoleSpy.warn).toHaveBeenCalled()
        })

        it('logger.debug should call console.debug in test/dev environment', () => {
            logger.debug('test debug')
            expect(consoleSpy.debug).toHaveBeenCalled()
        })

        it('logger.info should accept context parameter', () => {
            logger.info('with context', { userId: 'u1', category: 'test' })
            expect(consoleSpy.log).toHaveBeenCalled()
        })

        it('logger.error should accept error and context parameters', () => {
            logger.error('with error', new Error('e'), { action: 'test' })
            expect(consoleSpy.error).toHaveBeenCalled()
        })
    })

    describe('shouldLog', () => {
        it('should allow info level in test environment', () => {
            expect(shouldLog('info')).toBe(true)
        })

        it('should allow error level in test environment', () => {
            expect(shouldLog('error')).toBe(true)
        })

        it('should allow warn level in test environment', () => {
            expect(shouldLog('warn')).toBe(true)
        })

        it('should allow debug level in test/dev environment', () => {
            // In test env, min level defaults to 'debug'
            expect(shouldLog('debug')).toBe(true)
        })
    })
})
