import { eq } from 'drizzle-orm'
import { userUsageLimits } from '@/drizzle/schemas'
import type { Database } from '@/lib/db'

export interface QuotaCheckResult {
    allowed: boolean
    currentUsage: number
    maxAllowed: number
    message?: string
}

/**
 * 检查用户的 AI Token 使用配额
 *
 * 逻辑：
 * - 查询 userUsageLimits 获取 monthlyAiTokens 和 maxMonthlyAiTokens
 * - maxMonthlyAiTokens == -1 表示无限制，允许请求
 * - monthlyAiTokens >= maxMonthlyAiTokens 时拒绝请求
 * - 否则允许请求
 */
export async function checkAiQuota(
    db: Database,
    userId: string
): Promise<QuotaCheckResult> {
    let usageRecord: any = null
    try {
        usageRecord = await db.query.userUsageLimits.findFirst({
            where: eq(userUsageLimits.userId, userId),
        })
    } catch {
        // Query failed (e.g., table not available), allow request
        return {
            allowed: true,
            currentUsage: 0,
            maxAllowed: -1,
        }
    }

    // 如果没有使用记录，允许请求（新用户默认无限制）
    if (!usageRecord) {
        return {
            allowed: true,
            currentUsage: 0,
            maxAllowed: -1,
        }
    }

    const currentUsage = usageRecord.monthlyAiTokens ?? 0
    const maxAllowed = usageRecord.maxMonthlyAiTokens ?? -1

    // -1 表示无限制
    if (maxAllowed === -1) {
        return {
            allowed: true,
            currentUsage,
            maxAllowed,
        }
    }

    // 检查是否超限
    if (currentUsage >= maxAllowed) {
        return {
            allowed: false,
            currentUsage,
            maxAllowed,
            message: `您的 AI 使用配额已用尽（已使用 ${currentUsage} / ${maxAllowed} tokens）。请升级会员计划以获取更多配额。`,
        }
    }

    return {
        allowed: true,
        currentUsage,
        maxAllowed,
    }
}
