interface LogContext {
  operation?: string
  userId?: string
  email?: string
  error?: Error
  data?: Record<string, any>
}

export class ErrorLogger {
  private context: string

  constructor(context: string) {
    this.context = context
  }

  logError(error: Error, context?: LogContext) {
    const errorInfo = {
      context: this.context,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context,
    }

    // 在开发环境中输出到控制台
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${this.context}] 错误:`, errorInfo)
    }

    // 在生产环境中可以发送到日志服务
    if (process.env.NODE_ENV === 'production') {
      // TODO: 集成外部日志服务 (如 Sentry, LogRocket 等)
      console.error(`[${this.context}] 错误:`, errorInfo)
    }
  }

  logWarning(message: string, context?: LogContext) {
    const warningInfo = {
      context: this.context,
      message,
      timestamp: new Date().toISOString(),
      ...context,
    }

    console.warn(`[${this.context}] 警告:`, warningInfo)
  }

  logInfo(message: string, context?: LogContext) {
    const infoLog = {
      context: this.context,
      message,
      timestamp: new Date().toISOString(),
      ...context,
    }

    if (process.env.NODE_ENV === 'development') {
      console.info(`[${this.context}] 信息:`, infoLog)
    }
  }
}

export const createLogger = (context: string) => new ErrorLogger(context)
