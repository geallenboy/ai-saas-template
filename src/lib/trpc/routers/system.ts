import { systemConfigs } from '@/drizzle/schemas'
import { TRPCError } from '@trpc/server'
import { eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { adminProcedure, createTRPCRouter } from '../server'

// System configuration data type enumeration
export const ConfigDataType = z.enum([
  'string',
  'number',
  'boolean',
  'json',
  'array',
])

// System configuration category enumeration
export const ConfigCategory = z.enum([
  'general',
  'payment',
  'ai',
  'notification',
  'security',
  'feature',
])

export const systemRouter = createTRPCRouter({
  /**
   * Get all system configurations
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

      // Filter sensitive configurations
      return configs.map(config => ({
        ...config,
        value: config.isSecret && !input.includeSecret ? '***' : config.value,
      }))
    }),

  /**
   * Get configuration based on key
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
          message: 'Configuration item does not exist',
        })
      }

      return config
    }),

  /**
   * Update configuration
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
          message: 'Configuration item does not exist',
        })
      }

      if (!config.isEditable) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This configuration item is not editable',
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

      ctx.logger.info(`Admin updated system configuration: ${input.key}`, {
        adminId: ctx.userId,
        configKey: input.key,
        oldValue: config.value,
        newValue: input.value,
      })

      return updatedConfig
    }),

  /**
   * Create new configuration
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
          message: 'Configuration item already exists',
        })
      }

      const [newConfig] = await ctx.db
        .insert(systemConfigs)
        .values({
          ...input,
          updatedBy: ctx.userId,
        })
        .returning()

      ctx.logger.info(`Admin created system configuration: ${input.key}`, {
        adminId: ctx.userId,
        configKey: input.key,
        category: input.category,
      })

      return newConfig
    }),

  /**
   * Delete configuration
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
          message: 'Configuration item does not exist',
        })
      }

      if (!config.isEditable) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This configuration item is not deletable',
        })
      }

      await ctx.db.delete(systemConfigs).where(eq(systemConfigs.key, input.key))

      ctx.logger.info(
        `Administrator deletes system configuration: ${input.key}`,
        {
          adminId: ctx.userId,
          configKey: input.key,
        }
      )

      return { message: 'Configuration deleted successfully' }
    }),

  /**
   * Batch update configurations
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

      // Check if all configurations exist and are editable
      const existingConfigs = await ctx.db
        .select()
        .from(systemConfigs)
        .where(inArray(systemConfigs.key, keys))

      const editableConfigs = existingConfigs.filter(c => c.isEditable)

      if (editableConfigs.length !== input.configs.length) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Some configuration items do not exist or cannot be edited',
        })
      }

      // Update configurations one by one
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

      ctx.logger.info(
        `Admin bulk updated system configurations: ${keys.join(', ')}`,
        {
          adminId: ctx.userId,
          configKeys: keys,
        }
      )

      return results
    }),

  /**
   * Reset configuration to default value
   */
  resetConfigToDefault: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Default values should be defined based on business requirements
      const defaultValues: Record<string, any> = {
        'site.name': 'AI SaaS Template',
        'site.description': 'Next-generation AI SaaS platform',
        'payment.enabled': true,
        'ai.max_tokens': 4000,
        'notification.email_enabled': true,
      }

      const defaultValue = defaultValues[input.key]
      if (defaultValue === undefined) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'This configuration item does not have a default value',
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

      ctx.logger.info(
        `Administrator resets configuration to default values: ${input.key}`,
        {
          adminId: ctx.userId,
          configKey: input.key,
          defaultValue,
        }
      )

      return updated
    }),

  /**
   * Get configuration categories
   */
  getConfigCategories: adminProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db
      .selectDistinct({ category: systemConfigs.category })
      .from(systemConfigs)

    return categories.map(c => c.category)
  }),
})
