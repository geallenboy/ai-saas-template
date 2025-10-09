import { httpBatchLink, loggerLink, splitLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import superjson from 'superjson'
import { authLink } from './auth-link'
import { httpSubscriptionLink } from './http-subscription-link'
import type { AppRouter } from './root'

/**
 * 创建tRPC React客户端
 */
export const trpc = createTRPCReact<AppRouter>()

/**
 * 获取基础URL
 */
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // 浏览器环境，使用相对路径
    return ''
  }

  if (process.env.VERCEL_URL) {
    // 在Vercel环境中运行，返回Vercel URL
    return `https://${process.env.VERCEL_URL}`
  }

  // 开发环境或其他环境
  return `http://localhost:${process.env.PORT ?? 3000}`
}

/**
 * tRPC客户端配置
 */
export function getTRPCClientConfig() {
  const apiUrl = `${getBaseUrl()}/api/trpc`

  return trpc.createClient({
    links: [
      loggerLink({
        enabled: opts =>
          process.env.NODE_ENV === 'development' ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),
      authLink, // 动态认证链接，每次请求时获取最新令牌
      splitLink({
        condition: op => op.type === 'subscription',
        true: httpSubscriptionLink({
          url: apiUrl,
          transformer: superjson,
          eventSourceOptions: { withCredentials: true },
        }),
        false: httpBatchLink({
          url: apiUrl,
          transformer: superjson,
          fetch: async (url, options) => {
            // 确保 cookies 被发送
            const response = await fetch(url, {
              ...options,
              credentials: 'include',
            })

            // 处理认证错误
            if (response.status === 401) {
              console.warn('tRPC: Received 401 UNAUTHORIZED from Better Auth')

              // 在客户端清除认证状态
              if (typeof window !== 'undefined') {
                // 清除 Better Auth 相关的存储
                localStorage.removeItem('ai-saas-auth')

                // 尝试清除其他可能的认证存储
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('auth-storage')

                // 通知用户需要重新登录
                console.log('Better Auth session expired, please login again')

                // 可选择性地重定向到登录页面
                if (window.location.pathname !== '/auth/login') {
                  window.location.href = `/auth/login?redirect_url=${encodeURIComponent(
                    window.location.pathname
                  )}`
                }
              }
            }

            return response
          },
        }),
      }),
    ],
  })
}
