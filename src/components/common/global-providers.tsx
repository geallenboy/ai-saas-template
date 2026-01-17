'use client'

import { ThemeProvider } from 'next-themes'
import { type ReactNode, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'sonner'
import { TRPCProvider } from '@/server/provider'

interface GlobalProvidersProps {
  children: ReactNode
}

// 错误回退组件
function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-red-600 mb-2">
          出现了一些问题
        </h2>
        <p className="text-sm text-red-500 mb-4">{error.message}</p>
        <button
          type="button"
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          重试
        </button>
      </div>
    </div>
  )
}

// 加载回退组件
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )
}

export function GlobalProviders({ children }: GlobalProvidersProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <TRPCProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="theme"
        >
          <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={2000}
          />
        </ThemeProvider>
      </TRPCProvider>
    </ErrorBoundary>
  )
}
