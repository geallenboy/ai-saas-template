'use client'

import { TRPCProvider } from '@/lib/trpc/provider'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from 'next-themes'
import { type ReactNode, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'sonner'

interface GlobalProvidersProps {
  children: ReactNode
}

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-red-600 mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-red-500 mb-4">{error.message}</p>
        <button
          type="button"
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

// Loading the fallback component
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
      <ClerkProvider
        appearance={{
          variables: {
            colorPrimary: '#2563eb',
          },
        }}
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      >
        <TRPCProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
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
      </ClerkProvider>
    </ErrorBoundary>
  )
}
