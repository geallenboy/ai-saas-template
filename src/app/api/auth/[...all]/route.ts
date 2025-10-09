import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/lib/auth/better-auth/server'

// Better Auth API 路由处理器
export const { POST, GET } = toNextJsHandler(auth)

// 支持的HTTP方法
export const runtime = 'nodejs'

// 路由配置
export const dynamic = 'force-dynamic'
