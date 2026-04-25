import { and, eq } from 'drizzle-orm'
import { couponUsage } from '@/drizzle/schemas/coupon-usage'
import { coupons } from '@/drizzle/schemas/payments'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

// ===============================
// 优惠码验证和折扣计算服务
// ===============================

export interface CouponValidationResult {
    valid: boolean
    coupon?: typeof coupons.$inferSelect
    discount: number
    errorCode?:
    | 'NOT_FOUND'
    | 'INACTIVE'
    | 'EXPIRED'
    | 'NOT_STARTED'
    | 'MAX_USES_REACHED'
    | 'USER_LIMIT_REACHED'
    | 'PLAN_NOT_APPLICABLE'
    | 'BELOW_MIN_AMOUNT'
    errorMessage?: string
}

/**
 * 计算折扣金额（纯函数，可独立测试）
 */
export function calculateDiscount(
    discountType: string,
    discountValue: number,
    paymentAmount: number
): number {
    if (paymentAmount <= 0 || discountValue <= 0) {
        return 0
    }

    if (discountType === 'percent') {
        // 百分比折扣：amount * percentage / 100
        const clampedPercent = Math.min(discountValue, 100)
        return Math.round(paymentAmount * clampedPercent) / 100
    }

    // 固定金额折扣：min(fixedAmount, paymentAmount)
    return Math.min(discountValue, paymentAmount)
}

/**
 * 验证优惠码并计算折扣
 */
export async function validateCoupon(params: {
    code: string
    userId: string
    paymentAmount: number
    planId?: string
}): Promise<CouponValidationResult> {
    const { code, userId, paymentAmount, planId } = params

    // 1. 查找优惠码
    const coupon = await db.query.coupons.findFirst({
        where: eq(coupons.code, code.toUpperCase()),
    })

    if (!coupon) {
        return {
            valid: false,
            discount: 0,
            errorCode: 'NOT_FOUND',
            errorMessage: '优惠码不存在',
        }
    }

    // 2. 检查是否激活
    if (!coupon.isActive) {
        return {
            valid: false,
            discount: 0,
            errorCode: 'INACTIVE',
            errorMessage: '优惠码已停用',
        }
    }

    // 3. 检查有效期
    const now = new Date()

    if (coupon.startsAt && now < new Date(coupon.startsAt)) {
        return {
            valid: false,
            discount: 0,
            errorCode: 'NOT_STARTED',
            errorMessage: '优惠码尚未生效',
        }
    }

    if (coupon.expiresAt && now > new Date(coupon.expiresAt)) {
        return {
            valid: false,
            discount: 0,
            errorCode: 'EXPIRED',
            errorMessage: '优惠码已过期',
        }
    }

    // 4. 检查全局使用次数限制
    if (coupon.maxUses !== null && (coupon.usedCount ?? 0) >= coupon.maxUses) {
        return {
            valid: false,
            discount: 0,
            errorCode: 'MAX_USES_REACHED',
            errorMessage: '优惠码已达到最大使用次数',
        }
    }

    // 5. 检查用户使用次数限制
    if (coupon.maxUsesPerUser) {
        const userUsageCount = await db
            .select()
            .from(couponUsage)
            .where(
                and(
                    eq(couponUsage.couponId, coupon.id),
                    eq(couponUsage.userId, userId)
                )
            )

        if (userUsageCount.length >= coupon.maxUsesPerUser) {
            return {
                valid: false,
                discount: 0,
                errorCode: 'USER_LIMIT_REACHED',
                errorMessage: '您已达到该优惠码的使用次数上限',
            }
        }
    }

    // 6. 检查适用计划
    if (planId && coupon.applicablePlans && Array.isArray(coupon.applicablePlans)) {
        const applicablePlans = coupon.applicablePlans as string[]
        if (applicablePlans.length > 0 && !applicablePlans.includes(planId)) {
            return {
                valid: false,
                discount: 0,
                errorCode: 'PLAN_NOT_APPLICABLE',
                errorMessage: '优惠码不适用于当前计划',
            }
        }
    }

    // 7. 检查最低金额
    if (coupon.minAmount && paymentAmount < Number(coupon.minAmount)) {
        return {
            valid: false,
            discount: 0,
            errorCode: 'BELOW_MIN_AMOUNT',
            errorMessage: `订单金额需满 ${coupon.minAmount} 才能使用此优惠码`,
        }
    }

    // 8. 计算折扣
    const discount = calculateDiscount(
        coupon.discountType,
        Number(coupon.discountValue),
        paymentAmount
    )

    return {
        valid: true,
        coupon,
        discount,
    }
}

/**
 * 记录优惠码使用
 */
export async function recordCouponUsage(params: {
    couponId: string
    userId: string
    paymentRecordId?: string
    discountAmount: number
}): Promise<void> {
    const { couponId, userId, paymentRecordId, discountAmount } = params

    // 插入使用记录
    await db.insert(couponUsage).values({
        couponId,
        userId,
        paymentRecordId: paymentRecordId ?? null,
        discountAmount: discountAmount.toString(),
        createdAt: new Date(),
    })

    // 更新优惠码使用计数
    const coupon = await db.query.coupons.findFirst({
        where: eq(coupons.id, couponId),
    })

    if (coupon) {
        await db
            .update(coupons)
            .set({
                usedCount: (coupon.usedCount ?? 0) + 1,
                updatedAt: new Date(),
            })
            .where(eq(coupons.id, couponId))
    }

    logger.info('优惠码使用已记录', {
        category: 'coupon',
        couponId,
        userId,
        discountAmount,
    })
}
