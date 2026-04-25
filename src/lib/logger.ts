/**
 * Structured Logger System
 *
 * - Supports log levels: debug, info, warn, error
 * - Production: JSON format output
 * - Development: human-readable text output
 * - Maintains backward-compatible API (info, warn, error, debug method signatures)
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  category?: string
  userId?: string
  action?: string
  requestId?: string
  traceId?: string
  duration?: number
  [key: string]: any
}

export interface StructuredLogger {
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, error?: Error, context?: LogContext): void
  debug(message: string, context?: LogContext): void
}

interface StructuredLogEntry {
  timestamp: string
  level: LogLevel
  message: string
  error?: { name: string; message: string; stack?: string }
  [key: string]: unknown
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function getMinLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL as LogLevel | undefined
  if (envLevel && envLevel in LOG_LEVEL_PRIORITY) {
    return envLevel
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

function shouldLog(level: LogLevel): boolean {
  const minLevel = getMinLogLevel()
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[minLevel]
}

function buildLogEntry(
  level: LogLevel,
  message: string,
  error?: Error | null,
  context?: LogContext
): StructuredLogEntry {
  const entry: StructuredLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  if (context) {
    for (const [key, value] of Object.entries(context)) {
      if (value !== undefined) {
        entry[key] = value
      }
    }
  }

  return entry
}

function formatDevLog(entry: StructuredLogEntry): string {
  const { timestamp, level, message, error: errorInfo, ...rest } = entry
  const time = timestamp.slice(11, 23) // HH:mm:ss.SSS
  const levelTag = `[${level.toUpperCase()}]`

  const contextKeys = Object.keys(rest)
  const contextStr =
    contextKeys.length > 0 ? ` ${JSON.stringify(rest)}` : ''

  let output = `${time} ${levelTag} ${message}${contextStr}`

  if (errorInfo) {
    output += `\n  Error: ${errorInfo.name}: ${errorInfo.message}`
    if (errorInfo.stack) {
      output += `\n  ${errorInfo.stack}`
    }
  }

  return output
}

function writeLog(entry: StructuredLogEntry): void {
  const output = isProduction()
    ? JSON.stringify(entry)
    : formatDevLog(entry)

  switch (entry.level) {
    case 'error':
      console.error(output)
      break
    case 'warn':
      console.warn(output)
      break
    case 'debug':
      console.debug(output)
      break
    default:
      console.log(output)
      break
  }
}

class Logger implements StructuredLogger {
  info(message: string, context?: LogContext): void {
    if (!shouldLog('info')) return
    const entry = buildLogEntry('info', message, null, context)
    writeLog(entry)
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (!shouldLog('error')) return
    const entry = buildLogEntry('error', message, error, context)
    writeLog(entry)
  }

  debug(message: string, context?: LogContext): void {
    if (!shouldLog('debug')) return
    const entry = buildLogEntry('debug', message, null, context)
    writeLog(entry)
  }

  warn(message: string, context?: LogContext): void {
    if (!shouldLog('warn')) return
    const entry = buildLogEntry('warn', message, null, context)
    writeLog(entry)
  }
}

export const logger = new Logger()

// Export internals for testing
export const _internals = {
  buildLogEntry,
  formatDevLog,
  shouldLog,
  isProduction,
  LOG_LEVEL_PRIORITY,
}
