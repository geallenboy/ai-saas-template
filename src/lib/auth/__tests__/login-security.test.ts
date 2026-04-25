import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies before importing the module under test
vi.mock('@/lib/cache', () => {
    const store = new Map<string, { value: any; expiresAt?: number }>()
    return {
        cacheService: {
            get: vi.fn(async (key: string) => {
                const item = store.get(key)
                if (!item) return null
                if (item.expiresAt && Date.now() > item.expiresAt) {
                    store.delete(key)
                    return null
                }
                return item.value
            }),
            set: vi.fn(async (key: string, value: any, ttl?: number) => {
                store.set(key, {
                    value,
                    expiresAt: ttl ? Date.now() + ttl * 1000 : undefined,
                })
            }),
            del: vi.fn(async (key: string) => {
                store.delete(key)
                return true
            }),
            _store: store,
        },
    }
})

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}))

import { cacheService } from '@/lib/cache'
import {
    checkLoginAttempts,
    isAccountLocked,
    LOGIN_SECURITY_CONFIG,
    lockAccount,
    recordLoginAttempt,
} from '../login-security'

const mockStore = (cacheService as any)._store as Map<string, any>

describe('login-security', () => {
    beforeEach(() => {
        mockStore.clear()
        vi.clearAllMocks()
    })

    afterEach(() => {
        mockStore.clear()
    })

    describe('checkLoginAttempts', () => {
        it('allows login when no previous attempts exist', async () => {
            const result = await checkLoginAttempts('user@example.com', '127.0.0.1')
            expect(result.allowed).toBe(true)
            expect(result.remainingAttempts).toBe(LOGIN_SECURITY_CONFIG.MAX_FAILED_ATTEMPTS)
        })

        it('returns correct remaining attempts after some failures', async () => {
            // Simulate 3 failed attempts stored in cache
            await cacheService.set('login-security:attempts:user@example.com', 3, 900)

            const result = await checkLoginAttempts('user@example.com', '127.0.0.1')
            expect(result.allowed).toBe(true)
            expect(result.remainingAttempts).toBe(
                LOGIN_SECURITY_CONFIG.MAX_FAILED_ATTEMPTS - 3
            )
        })

        it('denies login when account is locked', async () => {
            const lockUntil = Date.now() + 15 * 60 * 1000
            await cacheService.set('login-security:lock:user@example.com', { lockedUntil: lockUntil }, 900)

            const result = await checkLoginAttempts('user@example.com', '127.0.0.1')
            expect(result.allowed).toBe(false)
            expect(result.remainingAttempts).toBe(0)
            expect(result.lockUntil).toBeDefined()
        })

        it('auto-locks when failed attempts reach threshold', async () => {
            await cacheService.set(
                'login-security:attempts:user@example.com',
                LOGIN_SECURITY_CONFIG.MAX_FAILED_ATTEMPTS,
                900
            )

            const result = await checkLoginAttempts('user@example.com', '127.0.0.1')
            expect(result.allowed).toBe(false)
            expect(result.remainingAttempts).toBe(0)
            expect(result.lockUntil).toBeDefined()
        })
    })

    describe('recordLoginAttempt', () => {
        it('clears failed count on successful login', async () => {
            await cacheService.set('login-security:attempts:user@example.com', 3, 900)

            await recordLoginAttempt('user@example.com', '127.0.0.1', true)

            expect(cacheService.del).toHaveBeenCalled()
        })

        it('increments failed count on failed login', async () => {
            await recordLoginAttempt('user@example.com', '127.0.0.1', false)

            // After one failure, the count should be set to 1
            const stored = await cacheService.get<number>('login-security:attempts:user@example.com')
            expect(stored).toBe(1)
        })

        it('auto-locks account after reaching max failed attempts', async () => {
            // Set attempts to just below threshold
            await cacheService.set(
                'login-security:attempts:user@example.com',
                LOGIN_SECURITY_CONFIG.MAX_FAILED_ATTEMPTS - 1,
                900
            )

            await recordLoginAttempt('user@example.com', '127.0.0.1', false)

            // Account should now be locked
            const locked = await isAccountLocked('user@example.com')
            expect(locked).toBe(true)
        })
    })

    describe('lockAccount', () => {
        it('locks account for specified duration', async () => {
            await lockAccount('user@example.com', 15)

            const locked = await isAccountLocked('user@example.com')
            expect(locked).toBe(true)
        })
    })

    describe('isAccountLocked', () => {
        it('returns false when account is not locked', async () => {
            const result = await isAccountLocked('user@example.com')
            expect(result).toBe(false)
        })

        it('returns true when account is locked and lock has not expired', async () => {
            const lockUntil = Date.now() + 15 * 60 * 1000
            await cacheService.set('login-security:lock:user@example.com', { lockedUntil: lockUntil }, 900)

            const result = await isAccountLocked('user@example.com')
            expect(result).toBe(true)
        })

        it('returns false and cleans up when lock has expired', async () => {
            const lockUntil = Date.now() - 1000 // expired
            await cacheService.set('login-security:lock:user@example.com', { lockedUntil: lockUntil }, 900)

            const result = await isAccountLocked('user@example.com')
            expect(result).toBe(false)
        })
    })
})
