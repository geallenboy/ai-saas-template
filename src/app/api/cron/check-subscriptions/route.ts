import { type NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { checkExpiringSubscriptions } from '@/lib/services/subscription-notification'

/**
 * Cron endpoint: 检查即将到期的订阅并发送通知
 *
 * 可通过 Vercel Cron 或外部 cron 服务每日调用一次
 * 需要通过 Authorization header 传递 CRON_SECRET 进行鉴权
 *
 * Vercel Cron 配置示例 (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-subscriptions",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */
export async function GET(req: NextRequest) {
    try {
        // 验证 cron 密钥（Vercel Cron 会自动附加 Authorization header）
        const authHeader = req.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            logger.warn('Cron endpoint 鉴权失败', {
                category: 'cron',
            })
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        logger.info('开始检查即将到期的订阅', { category: 'cron' })

        const result = await checkExpiringSubscriptions()

        return NextResponse.json({
            success: true,
            ...result,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        logger.error('Cron 任务执行失败', error as Error, {
            category: 'cron',
        })
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
