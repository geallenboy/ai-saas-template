import {
  boolean,
  index,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

// ===============================
// 权限审计日志表
// ===============================

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),

    // 用户信息
    userId: varchar('user_id', { length: 255 }).notNull(), // 操作用户ID
    userEmail: varchar('user_email', { length: 255 }), // 操作用户邮箱

    // 操作信息
    action: varchar('action', { length: 100 }).notNull(), // 操作类型
    resource: varchar('resource', { length: 100 }), // 资源类型
    resourceId: varchar('resource_id', { length: 255 }), // 资源ID

    // 操作详情
    details: jsonb('details').$type<{
      oldValue?: any
      newValue?: any
      changes?: Record<string, any>
      reason?: string
      [key: string]: any
    }>(),

    // 操作结果
    success: boolean('success').default(true), // 操作是否成功
    errorMessage: text('error_message'), // 错误信息（如果失败）

    // 请求信息
    ipAddress: varchar('ip_address', { length: 45 }), // IP地址（支持IPv6）
    userAgent: text('user_agent'), // 用户代理

    // 元数据
    module: varchar('module', { length: 50 }), // 模块名称
    severity: varchar('severity', { length: 20 }).default('INFO'), // 严重级别

    // 时间戳
    createdAt: timestamp('created_at').defaultNow().notNull(),

    // 额外的上下文信息
    context: jsonb('context').$type<{
      sessionId?: string
      requestId?: string
      adminLevel?: number
      organizationId?: string
      [key: string]: any
    }>(),
  },
  table => ({
    // 索引优化查询性能
    userIdIdx: index('audit_logs_user_id_idx').on(table.userId),
    actionIdx: index('audit_logs_action_idx').on(table.action),
    resourceIdx: index('audit_logs_resource_idx').on(table.resource),
    createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
    severityIdx: index('audit_logs_severity_idx').on(table.severity),
    successIdx: index('audit_logs_success_idx').on(table.success),
    moduleIdx: index('audit_logs_module_idx').on(table.module),

    // 复合索引
    userActionIdx: index('audit_logs_user_action_idx').on(
      table.userId,
      table.action
    ),
    resourceActionIdx: index('audit_logs_resource_action_idx').on(
      table.resource,
      table.action
    ),
    timeRangeIdx: index('audit_logs_time_range_idx').on(
      table.createdAt,
      table.userId
    ),
  })
)

// ===============================
// 类型定义
// ===============================

export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert

// ===============================
// 审计操作枚举
// ===============================

export enum AuditAction {
  // 用户管理
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_ACTIVATE = 'user.activate',
  USER_DEACTIVATE = 'user.deactivate',

  // 权限管理
  PERMISSION_GRANT = 'permission.grant',
  PERMISSION_REVOKE = 'permission.revoke',
  ROLE_ASSIGN = 'role.assign',
  ROLE_REMOVE = 'role.remove',
  ADMIN_PROMOTE = 'admin.promote',
  ADMIN_DEMOTE = 'admin.demote',

  // 系统管理
  SYSTEM_CONFIG_UPDATE = 'system.config.update',
  SYSTEM_MAINTENANCE = 'system.maintenance',
  DATA_EXPORT = 'data.export',
  DATA_IMPORT = 'data.import',

  // 组织管理
  ORG_CREATE = 'organization.create',
  ORG_UPDATE = 'organization.update',
  ORG_DELETE = 'organization.delete',
  ORG_MEMBER_ADD = 'organization.member.add',
  ORG_MEMBER_REMOVE = 'organization.member.remove',

  // 支付管理
  PAYMENT_CREATE = 'payment.create',
  PAYMENT_REFUND = 'payment.refund',
  SUBSCRIPTION_CREATE = 'subscription.create',
  SUBSCRIPTION_CANCEL = 'subscription.cancel',
}

export enum AuditResource {
  USER = 'user',
  ORGANIZATION = 'organization',
  PAYMENT = 'payment',
  SYSTEM = 'system',
  PERMISSION = 'permission',
  ROLE = 'role',
  SUBSCRIPTION = 'subscription',
}

export enum AuditSeverity {
  LOW = 'LOW',
  INFO = 'INFO',
  WARN = 'WARNING',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AuditModule {
  AUTH = 'auth',
  USER_MANAGEMENT = 'user_management',
  PERMISSION = 'permission',
  PAYMENT = 'payment',
  SYSTEM = 'system',
  ORGANIZATION = 'organization',
  API = 'api',
  WEBHOOK = 'webhook',
}
