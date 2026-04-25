import { and, eq, gt, lt, not } from 'drizzle-orm'
import { Resend } from 'resend'
import { membershipPlans, userMemberships } from '@/drizzle/schemas'
import { users } from '@/drizzle/schemas/users'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

// ===============================
// 订阅到期通知服务
// ===============================

/**
 * 检查即将到期的订阅并发送提醒邮件
 * 查找 7 天内到期的活跃订阅
 */
export async function checkExpiringSubscriptions(): Promise<{
    checked: number
    notified: number
    errors: number
}> {
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    let checked = 0
    let notified = 0
    let errors = 0

    try {
        // 查找 7 天内到期的活跃订阅
        const expiringMemberships = await db
            .select({
                membership: userMemberships,
                user: users,
                plan: membershipPlans,
            })
            .from(userMemberships)
            .innerJoin(users, eq(userMemberships.userId, users.id))
            .leftJoin(
                membershipPlans,
                eq(userMemberships.planId, membershipPlans.id)
            )
            .where(
                and(
                    eq(userMemberships.status, 'active'),
                    gt(userMemberships.endDate, now),
                    lt(userMemberships.endDate, sevenDaysFromNow),
                    // 排除已设置自动续费的订阅
                    not(eq(userMemberships.autoRenew, true))
                )
            )

        checked = expiringMemberships.length

        logger.info(`找到 ${checked} 个即将到期的订阅`, {
            category: 'subscription-notification',
        })

        for (const { membership, user, plan } of expiringMemberships) {
            try {
                const daysRemaining = Math.ceil(
                    (new Date(membership.endDate).getTime() - now.getTime()) /
                    (1000 * 60 * 60 * 24)
                )

                const planName = plan?.nameZh || plan?.name || '会员'
                const userEmail = user.email

                if (!userEmail) {
                    logger.warn(`用户 ${user.id} 没有邮箱地址，跳过通知`)
                    continue
                }

                await sendExpirationReminder({
                    email: userEmail,
                    userName: user.name || userEmail,
                    planName,
                    daysRemaining,
                    endDate: membership.endDate,
                })

                notified++
            } catch (error) {
                errors++
                logger.error(
                    `发送到期通知失败: 用户 ${user.id}`,
                    error as Error,
                    { category: 'subscription-notification' }
                )
            }
        }

        logger.info(
            `订阅到期通知完成: 检查 ${checked}, 通知 ${notified}, 错误 ${errors}`,
            { category: 'subscription-notification' }
        )
    } catch (error) {
        logger.error('检查到期订阅失败', error as Error, {
            category: 'subscription-notification',
        })
        throw error
    }

    return { checked, notified, errors }
}

/**
 * 发送到期提醒邮件
 */
async function sendExpirationReminder(params: {
    email: string
    userName: string
    planName: string
    daysRemaining: number
    endDate: Date
}): Promise<void> {
    const { email, userName, planName, daysRemaining, endDate } = params

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
        logger.warn('RESEND_API_KEY 未配置，跳过邮件发送', {
            category: 'subscription-notification',
        })
        return
    }

    const resend = new Resend(resendApiKey)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const formattedEndDate = endDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    const subject =
        daysRemaining <= 1
            ? `您的${planName}会员明天到期`
            : `您的${planName}会员将在 ${daysRemaining} 天后到期`

    const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a1a1a;">会员到期提醒</h2>
      <p style="color: #4a4a4a; line-height: 1.6;">
        您好 ${userName}，
      </p>
      <p style="color: #4a4a4a; line-height: 1.6;">
        您的 <strong>${planName}</strong> 会员将于 <strong>${formattedEndDate}</strong> 到期
        （还剩 <strong>${daysRemaining}</strong> 天）。
      </p>
      <p style="color: #4a4a4a; line-height: 1.6;">
        为了不中断您的服务，请及时续费。
      </p>
      <div style="margin: 30px 0;">
        <a href="${siteUrl}/pricing"
           style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          立即续费
        </a>
      </div>
      <p style="color: #9a9a9a; font-size: 12px;">
        如果您不想续费，可以忽略此邮件。会员到期后，您的账户将自动降级为免费版。
      </p>
    </div>
  `

    await resend.emails.send({
        from: 'AI SaaS Template <noreply@resend.dev>',
        to: email,
        subject,
        html: htmlContent,
    })

    logger.info(`到期提醒邮件已发送: ${email}`, {
        category: 'subscription-notification',
        daysRemaining,
        planName,
    })
}
