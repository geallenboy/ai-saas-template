import { authRouter } from './routers/auth'
import { paymentsRouter } from './routers/payments'
import { systemRouter } from './routers/system'
import { usersRouter } from './routers/users'
import { createTRPCRouter } from './server'

/**
 * 主tRPC路由器
 * 组合所有子路由器
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  users: usersRouter,
  payments: paymentsRouter,
  system: systemRouter,
})

// 导出类型定义，用于客户端类型推断
export type AppRouter = typeof appRouter
