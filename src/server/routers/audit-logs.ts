import { TRPCError } from '@trpc/server'
import { and, asc, count, desc, eq, gte, ilike, lte, sql } from 'drizzle-orm'
import { z } from 'zod'
import {
  AuditAction,
  AuditModule,
  AuditResource,
  AuditSeverity,
  auditLogs,
} from '@/drizzle/schemas'
import {
  adminProcedure,
  createTRPCRouter,
  superAdminProcedure,
} from '../server'

export const auditLogsRouter = createTRPCRouter({
  /**
   * 获取审计日志列表（分页、搜索、过滤）
   * 需要管理员权限
   */
  getAuditLogs: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(), // 搜索用户邮箱或操作

        // 过滤条件
        userId: z.string().optional(),
        action: z.nativeEnum(AuditAction).optional(),
        resource: z.nativeEnum(AuditResource).optional(),
        module: z.nativeEnum(AuditModule).optional(),
        severity: z.nativeEnum(AuditSeverity).optional(),
        success: z.boolean().optional(),

        // 时间范围
        startDate: z.date().optional(),
        endDate: z.date().optional(),

        // 排序
        sortBy: z
          .enum(['createdAt', 'action', 'severity', 'userId'])
          .default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        page,
        limit,
        search,
        userId,
        action,
        resource,
        module,
        severity,
        success,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      } = input

      // 构建查询条件
      const conditions = []

      // 搜索条件
      if (search) {
        conditions.push(
          ilike(auditLogs.userEmail, `%${search}%`),
          ilike(auditLogs.action, `%${search}%`)
        )
      }

      // 过滤条件
      if (userId) conditions.push(eq(auditLogs.userId, userId))
      if (action) conditions.push(eq(auditLogs.action, action))
      if (resource) conditions.push(eq(auditLogs.resource, resource))
      if (module) conditions.push(eq(auditLogs.module, module))
      if (severity) conditions.push(eq(auditLogs.severity, severity))
      if (success !== undefined) conditions.push(eq(auditLogs.success, success))

      // 时间范围过滤
      if (startDate) conditions.push(gte(auditLogs.createdAt, startDate))
      if (endDate) conditions.push(lte(auditLogs.createdAt, endDate))

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      // 获取总数
      const totalResult = await ctx.db
        .select({ total: count() })
        .from(auditLogs)
        .where(whereClause)

      const total = totalResult[0]?.total || 0

      // 获取日志列表
      const orderColumn = auditLogs[sortBy]
      const orderDirection =
        sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn)

      const logs = await ctx.db
        .select()
        .from(auditLogs)
        .where(whereClause)
        .orderBy(orderDirection)
        .limit(limit)
        .offset((page - 1) * limit)

      return {
        logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    }),

  /**
   * 根据ID获取审计日志详情
   * 需要管理员权限
   */
  getAuditLogById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const log = await ctx.db.query.auditLogs.findFirst({
        where: eq(auditLogs.id, input.id),
      })

      if (!log) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '审计日志不存在',
        })
      }

      return log
    }),

  /**
   * 获取审计日志统计数据
   * 需要管理员权限
   */
  getAuditStats: adminProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(30), // 统计天数
      })
    )
    .query(async ({ ctx, input }) => {
      const { days } = input
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const [stats] = await ctx.db
        .select({
          totalLogs: sql<number>`count(*)`,
          successfulActions: sql<number>`count(*) filter (where success = true)`,
          failedActions: sql<number>`count(*) filter (where success = false)`,
          uniqueUsers: sql<number>`count(distinct user_id)`,
          highSeverityLogs: sql<number>`count(*) filter (where severity in ('HIGH', 'CRITICAL'))`,
          recentLogs: sql<number>`count(*) filter (where created_at >= ${startDate})`,
        })
        .from(auditLogs)

      // 按操作类型统计
      const actionStats = await ctx.db
        .select({
          action: auditLogs.action,
          count: sql<number>`count(*)`,
        })
        .from(auditLogs)
        .where(gte(auditLogs.createdAt, startDate))
        .groupBy(auditLogs.action)
        .orderBy(desc(sql<number>`count(*)`))
        .limit(10)

      // 按模块统计
      const moduleStats = await ctx.db
        .select({
          module: auditLogs.module,
          count: sql<number>`count(*)`,
        })
        .from(auditLogs)
        .where(gte(auditLogs.createdAt, startDate))
        .groupBy(auditLogs.module)
        .orderBy(desc(sql<number>`count(*)`))

      // 按严重级别统计
      const severityStats = await ctx.db
        .select({
          severity: auditLogs.severity,
          count: sql<number>`count(*)`,
        })
        .from(auditLogs)
        .where(gte(auditLogs.createdAt, startDate))
        .groupBy(auditLogs.severity)
        .orderBy(desc(sql<number>`count(*)`))

      return {
        summary: stats,
        actionStats,
        moduleStats,
        severityStats,
        timeRange: {
          startDate,
          endDate: new Date(),
          days,
        },
      }
    }),

  /**
   * 获取用户的审计日志
   * 需要管理员权限
   */
  getUserAuditLogs: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, page, limit, days } = input
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // 获取总数
      const totalResult = await ctx.db
        .select({ total: count() })
        .from(auditLogs)
        .where(
          and(eq(auditLogs.userId, userId), gte(auditLogs.createdAt, startDate))
        )

      const total = totalResult[0]?.total || 0

      // 获取日志列表
      const logs = await ctx.db
        .select()
        .from(auditLogs)
        .where(
          and(eq(auditLogs.userId, userId), gte(auditLogs.createdAt, startDate))
        )
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset((page - 1) * limit)

      return {
        logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        timeRange: {
          startDate,
          endDate: new Date(),
          days,
        },
      }
    }),

  /**
   * 清理旧的审计日志
   * 需要超级管理员权限
   */
  cleanupOldLogs: superAdminProcedure
    .input(
      z.object({
        daysToKeep: z.number().min(30).max(2000).default(365), // 保留天数
        dryRun: z.boolean().default(true), // 试运行模式
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { daysToKeep, dryRun } = input
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      // 首先统计将要删除的记录数
      const [countResult] = await ctx.db
        .select({ count: count() })
        .from(auditLogs)
        .where(lte(auditLogs.createdAt, cutoffDate))

      const recordsToDelete = countResult?.count || 0

      if (dryRun) {
        // 试运行模式，只返回统计信息
        return {
          dryRun: true,
          cutoffDate,
          recordsToDelete,
          message: `试运行：将删除 ${recordsToDelete} 条审计日志记录`,
        }
      }

      // 实际删除操作
      await ctx.db.delete(auditLogs).where(lte(auditLogs.createdAt, cutoffDate))

      ctx.logger.info('超级管理员清理审计日志', {
        adminId: ctx.userId,
        recordsDeleted: recordsToDelete,
        cutoffDate,
        daysToKeep,
      })

      return {
        dryRun: false,
        cutoffDate,
        recordsDeleted: recordsToDelete,
        message: `成功删除 ${recordsToDelete} 条审计日志记录`,
      }
    }),

  /**
   * 导出审计日志
   * 需要超级管理员权限
   */
  exportAuditLogs: superAdminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        format: z.enum(['json', 'csv']).default('json'),
        filters: z
          .object({
            userId: z.string().optional(),
            action: z.nativeEnum(AuditAction).optional(),
            resource: z.nativeEnum(AuditResource).optional(),
            module: z.nativeEnum(AuditModule).optional(),
            severity: z.nativeEnum(AuditSeverity).optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { startDate, endDate, format, filters } = input

      // 构建查询条件
      const conditions = [
        gte(auditLogs.createdAt, startDate),
        lte(auditLogs.createdAt, endDate),
      ]

      if (filters?.userId) conditions.push(eq(auditLogs.userId, filters.userId))
      if (filters?.action) conditions.push(eq(auditLogs.action, filters.action))
      if (filters?.resource)
        conditions.push(eq(auditLogs.resource, filters.resource))
      if (filters?.module) conditions.push(eq(auditLogs.module, filters.module))
      if (filters?.severity)
        conditions.push(eq(auditLogs.severity, filters.severity))

      // 获取日志数据
      const logs = await ctx.db
        .select()
        .from(auditLogs)
        .where(and(...conditions))
        .orderBy(desc(auditLogs.createdAt))
        .limit(10000) // 限制导出数量

      ctx.logger.info('超级管理员导出审计日志', {
        adminId: ctx.userId,
        recordCount: logs.length,
        startDate,
        endDate,
        format,
        filters,
      })

      return {
        logs,
        metadata: {
          exportedAt: new Date(),
          recordCount: logs.length,
          timeRange: { startDate, endDate },
          format,
          filters,
        },
      }
    }),

  /**
   * 获取审计日志概览
   * 需要管理员权限
   */
  getAuditOverview: adminProcedure.query(async ({ ctx }) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    const [overview] = await ctx.db
      .select({
        totalLogs: sql<number>`count(*)`,
        todayLogs: sql<number>`count(*) filter (where date_trunc('day', created_at) = date_trunc('day', current_timestamp))`,
        yesterdayLogs: sql<number>`count(*) filter (where date_trunc('day', created_at) = date_trunc('day', current_timestamp - interval '1 day'))`,
        weekLogs: sql<number>`count(*) filter (where created_at >= ${lastWeek})`,
        failedActions: sql<number>`count(*) filter (where success = false)`,
        criticalLogs: sql<number>`count(*) filter (where severity = 'CRITICAL')`,
      })
      .from(auditLogs)

    // 最近的关键操作
    const recentCriticalLogs = await ctx.db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        userEmail: auditLogs.userEmail,
        action: auditLogs.action,
        resource: auditLogs.resource,
        severity: auditLogs.severity,
        success: auditLogs.success,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.severity, AuditSeverity.CRITICAL),
          gte(auditLogs.createdAt, lastWeek)
        )
      )
      .orderBy(desc(auditLogs.createdAt))
      .limit(10)

    return {
      overview,
      recentCriticalLogs,
    }
  }),
})
