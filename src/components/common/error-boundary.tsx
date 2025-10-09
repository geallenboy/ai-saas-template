'use client'

import { AlertTriangle, Bug, Home, RefreshCw } from 'lucide-react'
import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { logger } from '@/lib/logger'

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
 * 错误边界组件
 * 捕获子组件中的JavaScript错误，显示友好的错误界面
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
    // 更新state以显示错误UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    this.setState({
      error,
      errorInfo,
    })

    // 调用外部错误处理器
    this.props.onError?.(error, errorInfo)

    // 发送错误到监控服务
    this.logErrorToService(error, errorInfo)

    // 显示错误提示
    toast.error('页面出现错误，请刷新重试')
  }

  /**
   * 发送错误到监控服务
   */
  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    try {
      // 这里可以集成Sentry、LogRocket等监控服务
      logger.error('ErrorBoundary caught an error', error, {
        category: 'error_boundary',
        errorId: this.state.errorId,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      })

      // 示例：发送到监控API
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
   * 重置错误状态
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
   * 刷新页面
   */
  private handleRefresh = () => {
    window.location.reload()
  }

  /**
   * 返回首页
   */
  private handleGoHome = () => {
    window.location.href = '/'
  }

  /**
   * 复制错误信息
   */
  private handleCopyError = async () => {
    try {
      const errorText = `
错误ID: ${this.state.errorId}
错误信息: ${this.state.error?.message}
错误堆栈: ${this.state.error?.stack}
组件堆栈: ${this.state.errorInfo?.componentStack}
时间: ${new Date().toISOString()}
页面: ${window.location.href}
      `.trim()

      await navigator.clipboard.writeText(errorText)
      toast.success('错误信息已复制到剪贴板')
    } catch (_err) {
      toast.error('复制失败')
    }
  }

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">页面出现错误</CardTitle>
              <CardDescription>
                抱歉，页面遇到了一个意外错误。我们已经记录了这个问题。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 错误ID */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  错误ID:{' '}
                  <code className="font-mono text-xs">
                    {this.state.errorId}
                  </code>
                </p>
              </div>

              {/* 错误详情（开发环境或显式启用时） */}
              {(process.env.NODE_ENV === 'development' ||
                this.props.showDetails) &&
                this.state.error && (
                  <div className="space-y-2">
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                        查看错误详情
                      </summary>
                      <div className="mt-2 space-y-2 text-xs">
                        <div>
                          <strong>错误信息:</strong>
                          <pre className="mt-1 overflow-auto rounded bg-muted p-2 text-xs">
                            {this.state.error.message}
                          </pre>
                        </div>
                        {this.state.error.stack && (
                          <div>
                            <strong>错误堆栈:</strong>
                            <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
                              {this.state.error.stack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                )}

              {/* 操作按钮 */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={this.handleReset} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  重试
                </Button>
                <Button
                  onClick={this.handleRefresh}
                  variant="outline"
                  className="flex-1"
                >
                  刷新页面
                </Button>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  返回首页
                </Button>
                <Button
                  onClick={this.handleCopyError}
                  variant="ghost"
                  className="flex-1"
                >
                  <Bug className="mr-2 h-4 w-4" />
                  复制错误信息
                </Button>
              </div>

              {/* 帮助信息 */}
              <div className="text-center text-xs text-muted-foreground">
                如果问题持续存在，请联系技术支持并提供错误ID
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * 工作流模块专用错误边界
 */
export function WorkflowErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // 工作流模块特定的错误处理
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
              <CardTitle>工作流加载失败</CardTitle>
              <CardDescription>
                工作流模块遇到错误，请刷新页面重试
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                刷新页面
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
 * 简单的错误边界Hook（用于函数组件）
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
