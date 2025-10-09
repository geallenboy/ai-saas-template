'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { getTRPCClientConfig, trpc } from './client'

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 缓存时间配置
            staleTime: 5 * 60 * 1000, // 5分钟
            gcTime: 10 * 60 * 1000, // 10分钟
            // 错误重试配置
            retry: (failureCount, error) => {
              // 对于认证错误不重试
              if (error.message?.includes('UNAUTHORIZED')) {
                return false
              }
              // 最多重试2次
              return failureCount < 2
            },
            // 重新聚焦时不自动刷新
            refetchOnWindowFocus: false,
          },
          mutations: {
            // 变更错误重试配置
            retry: false,
          },
        },
      })
  )

  const [trpcClient] = useState(() => getTRPCClientConfig())

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
