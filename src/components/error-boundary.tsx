'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { logger } from '@/lib/logger'
import { AlertTriangle, Bug, Home, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { toast } from 'sonner'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
}

/**
 * Error Boundary Component
 * Captures JavaScript errors in child components and displays a friendly error interface
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state to display error UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error information
    this.setState({
      error,
      errorInfo,
    })

    // Call external error handler
    this.props.onError?.(error, errorInfo)

    // Send error to monitoring service
    this.logErrorToService(error, errorInfo)

    // Show error toast
    toast.error('An error occurred, please refresh and try again')
  }

  /**
   * Send error to monitoring service
   */
  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    try {
      // Here you can integrate monitoring services like Sentry, LogRocket, etc.
      logger.error('ErrorBoundary caught an error', error, {
        category: 'error_boundary',
        errorId: this.state.errorId,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      })

      // Example: Send to monitoring API
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/error-reporting', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            errorId: this.state.errorId,
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
          }),
        }).catch(err => {
          logger.error('Failed to report error', err as Error, {
            category: 'error_boundary',
            operation: 'report_error',
          })
        })
      }
    } catch (reportingError) {
      logger.error('Error reporting failed', reportingError as Error, {
        category: 'error_boundary',
        operation: 'log_error',
      })
    }
  }

  /**
   * Reset error state
   */
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    })
  }

  /**
   * Refresh page
   */
  private handleRefresh = () => {
    window.location.reload()
  }

  /**
   * Return to home page
   */
  private handleGoHome = () => {
    window.location.href = '/'
  }

  /**
   * Copy error information
   */
  private handleCopyError = async () => {
    try {
      const errorText = `
Error ID: ${this.state.errorId}
Error Message: ${this.state.error?.message}
Error Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
Time: ${new Date().toISOString()}
Page: ${window.location.href}
      `.trim()

      await navigator.clipboard.writeText(errorText)
      toast.success('Error information copied to clipboard')
    } catch (_err) {
      toast.error('Copy failed')
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorBoundaryView
          error={this.state.error}
          errorId={this.state.errorId}
          showDetails={this.props.showDetails}
          handleReset={this.handleReset}
          handleRefresh={this.handleRefresh}
          handleGoHome={this.handleGoHome}
          handleCopyError={this.handleCopyError}
        />
      )
    }

    return this.props.children
  }
}

// Separating the view to use hooks
function ErrorBoundaryView({
  error,
  errorId,
  showDetails,
  handleReset,
  handleRefresh,
  handleGoHome,
  handleCopyError,
}: {
  error: Error | null
  errorId: string
  showDetails?: boolean
  handleReset: () => void
  handleRefresh: () => void
  handleGoHome: () => void
  handleCopyError: () => void
}) {
  const t = useTranslations('errorPages.errorBoundary')

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('errorIdLabel')}{' '}
              <code className="font-mono text-xs">{errorId}</code>
            </p>
          </div>

          {(process.env.NODE_ENV === 'development' || showDetails) && error && (
            <div className="space-y-2">
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  {t('viewDetails')}
                </summary>
                <div className="mt-2 space-y-2 text-xs">
                  <div>
                    <strong>{t('errorMessageLabel')}</strong>
                    <pre className="mt-1 overflow-auto rounded bg-muted p-2 text-xs">
                      {error.message}
                    </pre>
                  </div>
                  {error.stack && (
                    <div>
                      <strong>{t('errorStackLabel')}</strong>
                      <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={handleReset} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('retryButton')}
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex-1"
            >
              {t('refreshButton')}
            </Button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={handleGoHome} variant="outline" className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              {t('goHomeButton')}
            </Button>
            <Button
              onClick={handleCopyError}
              variant="ghost"
              className="flex-1"
            >
              <Bug className="mr-2 h-4 w-4" />
              {t('copyErrorButton')}
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            {t('supportMessage')}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Workflow module-specific error boundaries
 */
export function WorkflowErrorBoundary({ children }: { children: ReactNode }) {
  const t = useTranslations('errorPages.errorBoundary.workflow')

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Workflow module-specific error handling
        logger.error('Workflow module error', error, {
          category: 'error_boundary',
          module: 'workflow',
          componentStack: errorInfo.componentStack,
        })
      }}
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-destructive mb-2" />
              <CardTitle>{t('title')}</CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('refreshButton')}
              </Button>
            </CardContent>
          </Card>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Simple error boundary hook (for function components)
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}
