import { TRPCError } from '@trpc/server'
import { eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { systemConfigs } from '@/drizzle/schemas'
import { adminProcedure, createTRPCRouter } from '../server'

// 系统配置数据类型枚举
export const ConfigDataType = z.enum([
  'string',
  'number',
  'boolean',
  'json',
  'array',
])

// 系统配置分类枚举
export const ConfigCategory = z.enum([
  'general',
  'payment',
  'ai',
  'notification',
  'security',
  'feature',
])

/**
 * 系统路由
 */
export const systemRouter = createTRPCRouter({
  /**
   * 获取所有系统配置
   */
  getConfigs: adminProcedure
    .input(
      z.object({
        category: ConfigCategory.optional(),
        includeSecret: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = []

      if (input.category) {
        conditions.push(eq(systemConfigs.category, input.category))
      }

      const configs = await ctx.db
        .select()
        .from(systemConfigs)
        .where(conditions.length > 0 ? conditions[0] : undefined)
        .orderBy(systemConfigs.category, systemConfigs.key)

      // 过滤敏感配置
      return configs.map(config => ({
        ...config,
        value: config.isSecret && !input.includeSecret ? '***' : config.value,
      }))
    }),

  /**
   * 根据key获取配置
   */
  getConfigByKey: adminProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx, input }) => {
      const config = await ctx.db.query.systemConfigs.findFirst({
        where: eq(systemConfigs.key, input.key),
      })

      if (!config) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '配置项不存在',
        })
      }

      return config
    }),

  /**
   * 更新配置
   */
  updateConfig: adminProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const config = await ctx.db.query.systemConfigs.findFirst({
        where: eq(systemConfigs.key, input.key),
      })

      if (!config) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '配置项不存在',
        })
      }

      if (!config.isEditable) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '该配置项不可编辑',
        })
      }

      const [updatedConfig] = await ctx.db
        .update(systemConfigs)
        .set({
          value: input.value,
          updatedBy: ctx.userId,
          updatedAt: new Date(),
        })
        .where(eq(systemConfigs.key, input.key))
        .returning()

      ctx.logger.info(`管理员更新系统配置: ${input.key}`, {
        adminId: ctx.userId,
        configKey: input.key,
        oldValue: config.value,
        newValue: input.value,
      })

      return updatedConfig
    }),

  /**
   * 创建新配置
   */
  createConfig: adminProcedure
    .input(
      z.object({
        key: z.string().min(1).max(100),
        value: z.any(),
        description: z.string().optional(),
        category: ConfigCategory,
        dataType: ConfigDataType,
        isEditable: z.boolean().default(true),
        isSecret: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingConfig = await ctx.db.query.systemConfigs.findFirst({
        where: eq(systemConfigs.key, input.key),
      })

      if (existingConfig) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: '配置项已存在',
        })
      }

      const [newConfig] = await ctx.db
        .insert(systemConfigs)
        .values({
          key: input.key,
          value: input.value,
          description: input.description,
          category: input.category,
          dataType: input.dataType,
          isEditable: input.isEditable,
          isSecret: input.isSecret,
          updatedBy: ctx.userId,
        })
        .returning()

      ctx.logger.info(`管理员创建系统配置: ${input.key}`, {
        adminId: ctx.userId,
        configKey: input.key,
        category: input.category,
      })

      return newConfig
    }),

  /**
   * 删除配置
   */
  deleteConfig: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const config = await ctx.db.query.systemConfigs.findFirst({
        where: eq(systemConfigs.key, input.key),
      })

      if (!config) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '配置项不存在',
        })
      }

      if (!config.isEditable) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '该配置项不可删除',
        })
      }

      await ctx.db.delete(systemConfigs).where(eq(systemConfigs.key, input.key))

      ctx.logger.info(`管理员删除系统配置: ${input.key}`, {
        adminId: ctx.userId,
        configKey: input.key,
      })

      return { message: '配置删除成功' }
    }),

  /**
   * 批量更新配置
   */
  batchUpdateConfigs: adminProcedure
    .input(
      z.object({
        configs: z.array(
          z.object({
            key: z.string(),
            value: z.any(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const keys = input.configs.map(c => c.key)

      // 检查所有配置是否存在且可编辑
      const existingConfigs = await ctx.db
        .select()
        .from(systemConfigs)
        .where(inArray(systemConfigs.key, keys))

      const editableConfigs = existingConfigs.filter(c => c.isEditable)

      if (editableConfigs.length !== input.configs.length) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '部分配置项不存在或不可编辑',
        })
      }

      // 逐个更新配置
      const results = []
      for (const configUpdate of input.configs) {
        const [updated] = await ctx.db
          .update(systemConfigs)
          .set({
            value: configUpdate.value,
            updatedBy: ctx.userId,
            updatedAt: new Date(),
          })
          .where(eq(systemConfigs.key, configUpdate.key))
          .returning()

        results.push(updated)
      }

      ctx.logger.info(`管理员批量更新系统配置: ${keys.join(', ')}`, {
        adminId: ctx.userId,
        configKeys: keys,
      })

      return results
    }),

  /**
   * 重置配置到默认值
   */
  resetConfigToDefault: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 这里需要根据业务需求定义默认值
      const defaultValues: Record<string, any> = {
        'site.name': 'AI SaaS Template',
        'site.description': '下一代AI SaaS平台',
        'payment.enabled': true,
        'ai.max_tokens': 4000,
        'notification.email_enabled': true,
      }

      const defaultValue = defaultValues[input.key]
      if (defaultValue === undefined) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '该配置项没有默认值',
        })
      }

      const [updated] = await ctx.db
        .update(systemConfigs)
        .set({
          value: defaultValue,
          updatedBy: ctx.userId,
          updatedAt: new Date(),
        })
        .where(eq(systemConfigs.key, input.key))
        .returning()

      ctx.logger.info(`管理员重置配置到默认值: ${input.key}`, {
        adminId: ctx.userId,
        configKey: input.key,
        defaultValue,
      })

      return updated
    }),

  /**
   * 获取配置分类列表
   */
  getConfigCategories: adminProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db
      .selectDistinct({ category: systemConfigs.category })
      .from(systemConfigs)

    return categories.map(c => c.category)
  }),
})
