import { describe, expect, it, vi } from 'vitest'
import { checkAiQuota } from '../quota'

/**
 * Creates a mock database object that simulates Drizzle ORM query behavior.
 * The findFirst function returns the provided usage record.
 */
function createMockDb(usageRecord: any = undefined) {
    return {
        query: {
            userUsageLimits: {
                findFirst: vi.fn().mockResolvedValue(usageRecord),
            },
        },
    } as any
}

/**
 * Creates a mock database that throws on query (simulates DB failure).
 */
function createFailingDb() {
    return {
        query: {
            userUsageLimits: {
                findFirst: vi.fn().mockRejectedValue(new Error('DB connection failed')),
            },
        },
    } as any
}

describe('checkAiQuota', () => {
    const userId = 'user-123'

    it('allows request when no usage record exists (new user)', async () => {
        const db = createMockDb(null)
        const result = await checkAiQuota(db, userId)

        expect(result.allowed).toBe(true)
        expect(result.currentUsage).toBe(0)
        expect(result.maxAllowed).toBe(-1)
    })

    it('allows request when maxMonthlyAiTokens is -1 (unlimited)', async () => {
        const db = createMockDb({
            monthlyAiTokens: 50000,
            maxMonthlyAiTokens: -1,
        })
        const result = await checkAiQuota(db, userId)

        expect(result.allowed).toBe(true)
        expect(result.currentUsage).toBe(50000)
        expect(result.maxAllowed).toBe(-1)
    })

    it('allows request when usage is below quota', async () => {
        const db = createMockDb({
            monthlyAiTokens: 5000,
            maxMonthlyAiTokens: 100000,
        })
        const result = await checkAiQuota(db, userId)

        expect(result.allowed).toBe(true)
        expect(result.currentUsage).toBe(5000)
        expect(result.maxAllowed).toBe(100000)
    })

    it('blocks request when usage equals quota', async () => {
        const db = createMockDb({
            monthlyAiTokens: 100000,
            maxMonthlyAiTokens: 100000,
        })
        const result = await checkAiQuota(db, userId)

        expect(result.allowed).toBe(false)
        expect(result.currentUsage).toBe(100000)
        expect(result.maxAllowed).toBe(100000)
        expect(result.message).toBeDefined()
        expect(result.message).toContain('升级')
    })

    it('blocks request when usage exceeds quota', async () => {
        const db = createMockDb({
            monthlyAiTokens: 150000,
            maxMonthlyAiTokens: 100000,
        })
        const result = await checkAiQuota(db, userId)

        expect(result.allowed).toBe(false)
        expect(result.message).toBeDefined()
    })

    it('handles null monthlyAiTokens as 0', async () => {
        const db = createMockDb({
            monthlyAiTokens: null,
            maxMonthlyAiTokens: 100000,
        })
        const result = await checkAiQuota(db, userId)

        expect(result.allowed).toBe(true)
        expect(result.currentUsage).toBe(0)
    })

    it('handles null maxMonthlyAiTokens as -1 (unlimited)', async () => {
        const db = createMockDb({
            monthlyAiTokens: 5000,
            maxMonthlyAiTokens: null,
        })
        const result = await checkAiQuota(db, userId)

        expect(result.allowed).toBe(true)
        expect(result.maxAllowed).toBe(-1)
    })

    it('allows request when database query fails (graceful degradation)', async () => {
        const db = createFailingDb()
        const result = await checkAiQuota(db, userId)

        expect(result.allowed).toBe(true)
        expect(result.currentUsage).toBe(0)
        expect(result.maxAllowed).toBe(-1)
    })
})
