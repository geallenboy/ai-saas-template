import { describe, expect, it, vi } from 'vitest'

// Mock db and logger to avoid env variable validation
vi.mock('@/lib/db', () => ({
    db: {
        query: { coupons: { findFirst: vi.fn() } },
        select: vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) }),
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
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

import { calculateDiscount } from '../coupon-service'

describe('calculateDiscount', () => {
    describe('percent discount', () => {
        it('calculates percentage discount correctly', () => {
            // 10% of 100 = 10
            const result = calculateDiscount('percent', 10, 100)
            expect(result).toBe(10)
        })

        it('clamps percentage to 100%', () => {
            // 150% should be clamped to 100%, so discount = paymentAmount
            const result = calculateDiscount('percent', 150, 200)
            expect(result).toBe(200)
        })

        it('handles small percentages', () => {
            // 1% of 50 = 0.5
            const result = calculateDiscount('percent', 1, 50)
            expect(result).toBe(0.5)
        })

        it('rounds to 2 decimal places', () => {
            // 33% of 100 = 33
            const result = calculateDiscount('percent', 33, 100)
            expect(result).toBe(33)
        })
    })

    describe('fixed discount', () => {
        it('applies fixed discount when less than payment amount', () => {
            const result = calculateDiscount('fixed', 20, 100)
            expect(result).toBe(20)
        })

        it('caps fixed discount at payment amount', () => {
            const result = calculateDiscount('fixed', 200, 100)
            expect(result).toBe(100)
        })

        it('returns exact amount when fixed equals payment', () => {
            const result = calculateDiscount('fixed', 50, 50)
            expect(result).toBe(50)
        })
    })

    describe('edge cases', () => {
        it('returns 0 for zero payment amount', () => {
            const result = calculateDiscount('percent', 10, 0)
            expect(result).toBe(0)
        })

        it('returns 0 for negative payment amount', () => {
            const result = calculateDiscount('percent', 10, -50)
            expect(result).toBe(0)
        })

        it('returns 0 for zero discount value', () => {
            const result = calculateDiscount('percent', 0, 100)
            expect(result).toBe(0)
        })

        it('returns 0 for negative discount value', () => {
            const result = calculateDiscount('fixed', -10, 100)
            expect(result).toBe(0)
        })
    })
})
