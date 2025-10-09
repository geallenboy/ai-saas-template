// 简单的日志记录器
interface LogContext {
  [key: string]: any
}

class SimpleLogger {
  info(message: string, context?: LogContext) {
    console.log(`[INFO] ${message}`, context || '')
  }

  error(message: string, error?: Error, context?: LogContext) {
    console.error(`[ERROR] ${message}`, error || '', context || '')
  }

  warn(message: string, context?: LogContext) {
    console.warn(`[WARN] ${message}`, context || '')
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context || '')
    }
  }
}

export const logger = new SimpleLogger()
