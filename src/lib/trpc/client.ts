import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import superjson from 'superjson'
import type { AppRouter } from './root'

/**
 * Creating a tRPC React Client
 */
export const trpc = createTRPCReact<AppRouter>()

/**
 * Get base URL
 */
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser environment, use relative path
    return ''
  }

  if (process.env.VERCEL_URL) {
    // Running in Vercel environment, return Vercel URL
    return `https://${process.env.VERCEL_URL}`
  }

  // Development or other environments
  return `http://localhost:${process.env.PORT ?? 3000}`
}

/**
 * tRPC client configuration
 */
export function getTRPCClientConfig() {
  return trpc.createClient({
    links: [
      loggerLink({
        enabled: opts =>
          process.env.NODE_ENV === 'development' ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
        headers() {
          return {
            // Add custom headers here if needed
          }
        },
      }),
    ],
  })
}
