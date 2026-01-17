import { createTRPCRouter } from './server'

/**
 * 主tRPC路由器
 * 组合所有子路由器
 */
export const appRouter = createTRPCRouter({
  // 在这里添加你的路由器
})

// 导出类型定义，用于客户端类型推断
export type AppRouter = typeof appRouter
