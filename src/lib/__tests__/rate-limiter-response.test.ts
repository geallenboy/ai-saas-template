import { describe, expect, it, vi } from 'vitest'

// Mock the cache and logger modules to avoid env validation
vi.mock('@/lib/cache', () => ({
    cacheService: {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue(undefined),
        del: vi.fn().mockResolvedValue(true),
    },
}))

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}))

import { RateLimitConfigs, RateLimitUtils } from '@/lib/rate-limiter'

describe('Rate Limiter - 429 Response', () => {
    describe('RateLimitUtils.createRateLimitResponse', () => {
        it('should return a Response with 429 status code', () => {
            const result = {
                allowed: false,
                totalHits: 100,
                timeToReset: 30000,
                remaining: 0,
            }
            const response = RateLimitUtils.createRateLimitResponse(
                result,
                RateLimitConfigs.api
            )
            expect(response.status).toBe(429)
        })

        it('should include Retry-After header as a positive integer string', () => {
            const result = {
                allowed: false,
                totalHits: 100,
                timeToReset: 30000, // 30 seconds
                remaining: 0,
            }
            const response = RateLimitUtils.createRateLimitResponse(
                result,
                RateLimitConfigs.api
            )
            const retryAfter = response.headers.get('Retry-After')
            expect(retryAfter).toBeDefined()
            const retryAfterNum = Number.parseInt(retryAfter!, 10)
            expect(retryAfterNum).toBeGreaterThan(0)
            expect(Number.isInteger(retryAfterNum)).toBe(true)
        })

        it('should include X-RateLimit-Limit header', () => {
            const result = {
                allowed: false,
                totalHits: 100,
                timeToReset: 5000,
                remaining: 0,
            }
            const response = RateLimitUtils.createRateLimitResponse(
                result,
                RateLimitConfigs.api
            )
            expect(response.headers.get('X-RateLimit-Limit')).toBe(
                RateLimitConfigs.api.maxRequests.toString()
            )
        })

        it('should include X-RateLimit-Remaining header as 0', () => {
            const result = {
                allowed: false,
                totalHits: 100,
                timeToReset: 5000,
                remaining: 0,
            }
            const response = RateLimitUtils.createRateLimitResponse(
                result,
                RateLimitConfigs.api
            )
            expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
        })

        it('should return JSON body with error details', async () => {
            const result = {
                allowed: false,
                totalHits: 100,
                timeToReset: 10000,
                remaining: 0,
            }
            const response = RateLimitUtils.createRateLimitResponse(
                result,
                RateLimitConfigs.api
            )
            const body = await response.json()
            expect(body.error).toBe(RateLimitConfigs.api.message)
            expect(body.retryAfter).toBeGreaterThan(0)
            expect(body.limit).toBe(RateLimitConfigs.api.maxRequests)
            expect(body.remaining).toBe(0)
        })

        it('should ensure Retry-After is at least 1 even for very small timeToReset', () => {
            const result = {
                allowed: false,
                totalHits: 100,
                timeToReset: 100, // 100ms
                remaining: 0,
            }
            const response = RateLimitUtils.createRateLimitResponse(
                result,
                RateLimitConfigs.api
            )
            const retryAfter = Number.parseInt(
                response.headers.get('Retry-After')!,
                10
            )
            expect(retryAfter).toBeGreaterThanOrEqual(1)
        })

        it('should use custom message from config', async () => {
            const result = {
                allowed: false,
                totalHits: 5,
                timeToReset: 900000,
                remaining: 0,
            }
            const response = RateLimitUtils.createRateLimitResponse(
                result,
                RateLimitConfigs.strict
            )
            expect(response.status).toBe(429)
            const body = await response.json()
            expect(body.error).toBe(RateLimitConfigs.strict.message)
        })

        it('should set Content-Type to application/json', () => {
            const result = {
                allowed: false,
                totalHits: 100,
                timeToReset: 5000,
                remaining: 0,
            }
            const response = RateLimitUtils.createRateLimitResponse(
                result,
                RateLimitConfigs.api
            )
            expect(response.headers.get('Content-Type')).toBe('application/json')
        })
    })

    describe('RateLimitUtils.generateHeaders', () => {
        it('should include Retry-After header', () => {
            const result = {
                allowed: false,
                totalHits: 100,
                timeToReset: 60000,
                remaining: 0,
            }
            const headers = RateLimitUtils.generateHeaders(
                result,
                RateLimitConfigs.api
            )
            expect(headers['Retry-After']).toBeDefined()
            const retryAfter = Number.parseInt(headers['Retry-After'], 10)
            expect(retryAfter).toBeGreaterThan(0)
        })
    })
})
