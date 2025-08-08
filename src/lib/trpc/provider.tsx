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
            // Cache time configuration
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            // Error retry configuration
            retry: (failureCount, error) => {
              // Do not retry for authentication errors
              if (error.message?.includes('UNAUTHORIZED')) {
                return false
              }
              // Retry up to 2 times
              return failureCount < 2
            },
            // Do not automatically refetch on window focus
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Change error retry configuration
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
