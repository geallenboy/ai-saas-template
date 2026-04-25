import { count, eq, gte, sql } from 'drizzle-orm'
import { z } from 'zod'
import {
    aiTokenUsage,
    paymentRecords,
    userMemberships,
    users,
} from '@/drizzle/schemas'
import { cache } from '@/lib/cache'
import { checkDatabaseHealth } from '@/lib/db'
import { adminProcedure, createTRPCRouter } from '../server'

/**
 * 管理仪表盘路由
 * 提供关键业务指标的数据聚合
 */
export const adminDashboardRouter = createTRPCRouter({
    /**
     * 获取仪表盘核心指标
     * 需要管理员权限
     */
    getMetrics: adminProcedure
        .input(
            z
                .object({
                    /** 统计时间范围（天数），默认 30 天 */
                    days: z.number().min(1).max(365).default(30),
                })
                .optional()
        )
        .query(async ({ ctx, input }) => {
            const days = input?.days ?? 30
            const now = new Date()
            const startDate = new Date(now)
            startDate.setDate(startDate.getDate() - days)

            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

            // ── 用户指标 ──
            const [totalUsersResult] = await ctx.db
                .select({ total: count() })
                .from(users)

            const [activeUsersResult] = await ctx.db
                .select({ total: count() })
                .from(users)
                .where(eq(users.isActive, true))

            const [paidUsersResult] = await ctx.db
                .select({ total: count() })
                .from(userMemberships)
                .where(eq(userMemberships.status, 'active'))

            const [newUsersThisMonthResult] = await ctx.db
                .select({ total: count() })
                .from(users)
                .where(gte(users.createdAt, monthStart))

            // ── 收入指标 ──
            const [totalRevenueResult] = await ctx.db
                .select({
                    total: sql<string>`coalesce(sum(${paymentRecords.amount}::numeric), 0)`,
                })
                .from(paymentRecords)
                .where(eq(paymentRecords.status, 'succeeded'))

            const [monthlyRevenueResult] = await ctx.db
                .select({
                    total: sql<string>`coalesce(sum(${paymentRecords.amount}::numeric), 0)`,
                })
                .from(paymentRecords)
                .where(
                    sql`${paymentRecords.status} = 'succeeded' AND ${paymentRecords.paidAt} >= ${monthStart}`
                )

            // MRR 近似值：当月成功支付总额
            const mrr = Number(monthlyRevenueResult?.total ?? 0)

            // ── AI 使用量指标 ──
            const [totalTokensResult] = await ctx.db
                .select({
                    total: sql<string>`coalesce(sum(${aiTokenUsage.totalTokens}), 0)`,
                })
                .from(aiTokenUsage)

            const [monthlyTokensResult] = await ctx.db
                .select({
                    total: sql<string>`coalesce(sum(${aiTokenUsage.totalTokens}), 0)`,
                })
                .from(aiTokenUsage)
                .where(gte(aiTokenUsage.createdAt, monthStart))

            const [activeAISessionsResult] = await ctx.db
                .select({
                    total: sql<number>`count(distinct ${aiTokenUsage.sessionId})`,
                })
                .from(aiTokenUsage)
                .where(gte(aiTokenUsage.createdAt, startDate))

            return {
                users: {
                    total: totalUsersResult?.total ?? 0,
                    active: activeUsersResult?.total ?? 0,
                    paid: paidUsersResult?.total ?? 0,
                    newThisMonth: newUsersThisMonthResult?.total ?? 0,
                },
                revenue: {
                    totalRevenue: Number(totalRevenueResult?.total ?? 0),
                    monthlyRevenue: Number(monthlyRevenueResult?.total ?? 0),
                    mrr,
                },
                ai: {
                    totalTokensUsed: Number(totalTokensResult?.total ?? 0),
                    monthlyTokensUsed: Number(monthlyTokensResult?.total ?? 0),
                    activeAISessions: activeAISessionsResult?.total ?? 0,
                },
            }
        }),

    /**
     * 获取收入趋势数据（按天聚合）
     * 需要管理员权限
     */
    getRevenueTrend: adminProcedure
        .input(
            z
                .object({
                    days: z.number().min(7).max(365).default(30),
                })
                .optional()
        )
        .query(async ({ ctx, input }) => {
            const days = input?.days ?? 30
            const startDate = new Date()
            startDate.setDate(startDate.getDate() - days)

            const trend = await ctx.db
                .select({
                    date: sql<string>`date_trunc('day', ${paymentRecords.paidAt})::date`,
                    amount: sql<string>`coalesce(sum(${paymentRecords.amount}::numeric), 0)`,
                    count: count(),
                })
                .from(paymentRecords)
                .where(
                    sql`${paymentRecords.status} = 'succeeded' AND ${paymentRecords.paidAt} >= ${startDate}`
                )
                .groupBy(sql`date_trunc('day', ${paymentRecords.paidAt})::date`)
                .orderBy(sql`date_trunc('day', ${paymentRecords.paidAt})::date`)

            return trend.map(row => ({
                date: row.date,
                amount: Number(row.amount),
                count: row.count,
            }))
        }),

    /**
     * 获取用户增长趋势数据（按天聚合）
     * 需要管理员权限
     */
    getUserGrowthTrend: adminProcedure
        .input(
            z
                .object({
                    days: z.number().min(7).max(365).default(30),
                })
                .optional()
        )
        .query(async ({ ctx, input }) => {
            const days = input?.days ?? 30
            const startDate = new Date()
            startDate.setDate(startDate.getDate() - days)

            const trend = await ctx.db
                .select({
                    date: sql<string>`date_trunc('day', ${users.createdAt})::date`,
                    count: count(),
                })
                .from(users)
                .where(gte(users.createdAt, startDate))
                .groupBy(sql`date_trunc('day', ${users.createdAt})::date`)
                .orderBy(sql`date_trunc('day', ${users.createdAt})::date`)

            return trend.map(row => ({
                date: row.date,
                count: row.count,
            }))
        }),

    /**
     * 系统健康监控
     * 检查数据库、Redis、外部 API 服务状态
     * 需要管理员权限
     */
    getSystemHealth: adminProcedure.query(async ({ ctx: _ctx }) => {
        const checks: Record<
            string,
            { status: 'healthy' | 'degraded' | 'down'; latencyMs: number; message?: string }
        > = {}

        // 数据库健康检查
        const dbStart = Date.now()
        try {
            const dbHealthy = await checkDatabaseHealth()
            checks.database = {
                status: dbHealthy ? 'healthy' : 'down',
                latencyMs: Date.now() - dbStart,
                message: dbHealthy ? 'PostgreSQL 连接正常' : 'PostgreSQL 连接失败',
            }
        } catch (error) {
            checks.database = {
                status: 'down',
                latencyMs: Date.now() - dbStart,
                message: `PostgreSQL 错误: ${(error as Error).message}`,
            }
        }

        // Redis 健康检查
        const redisStart = Date.now()
        try {
            const redisHealthy = await cache.health()
            const cacheStats = await cache.stats()
            checks.redis = {
                status: redisHealthy ? 'healthy' : 'degraded',
                latencyMs: Date.now() - redisStart,
                message: redisHealthy
                    ? `${cacheStats.type} 连接正常 (${cacheStats.keyCount} keys)`
                    : `${cacheStats.type} 回退模式`,
            }
        } catch (error) {
            checks.redis = {
                status: 'down',
                latencyMs: Date.now() - redisStart,
                message: `Redis 错误: ${(error as Error).message}`,
            }
        }

        // 系统运行时信息
        const memoryUsage = process.memoryUsage()
        const uptime = process.uptime()

        // 总体状态
        const allStatuses = Object.values(checks).map(c => c.status)
        const overallStatus = allStatuses.includes('down')
            ? 'down'
            : allStatuses.includes('degraded')
                ? 'degraded'
                : 'healthy'

        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            checks,
            system: {
                uptimeSeconds: Math.floor(uptime),
                memoryUsageMB: {
                    rss: Math.round(memoryUsage.rss / 1024 / 1024),
                    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                },
                nodeVersion: process.version,
            },
        }
    }),
})
