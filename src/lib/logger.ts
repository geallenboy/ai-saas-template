interface LogContext {
  category?: string
  userId?: string
  action?: string
  [key: string]: any
}

class Logger {
  info(message: string, context?: LogContext) {
    console.log(`[INFO] ${message}`, context)
  }

  error(message: string, error?: Error, context?: LogContext) {
    console.error(`[ERROR] ${message}`, error, context)
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context)
    }
  }

  warn(message: string, context?: LogContext) {
    console.warn(`[WARN] ${message}`, context)
  }
}

export const logger = new Logger()
