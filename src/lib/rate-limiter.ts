import { cacheService } from '@/lib/cache'
import { logger } from '@/lib/logger'

// Current limiting configuration interface
interface RateLimitConfig {
  windowMs: number // Time window (milliseconds)
  maxRequests: number // Maximum number of requests
  message?: string // Exceeded limit message
  skipSuccessfulRequests?: boolean // Whether to skip successful requests
  skipFailedRequests?: boolean // Whether to skip failed requests
  keyGenerator?: (identifier: string) => string // Custom key generator
}

// Rate limit result interface
interface RateLimitResult {
  allowed: boolean // Whether allowed
  totalHits: number // Total number of requests
  timeToReset: number // Time to reset (milliseconds)
  remaining: number // Remaining number of requests
}

// Rate limiter class
class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Too many requests',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (identifier: string) => `rate-limit:${identifier}`,
      ...config,
    }
  }

  // Check and record request
  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = this.config.keyGenerator!(identifier)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    try {
      // Get requests in current window
      const requests = await this.getRequestsInWindow(key, windowStart)

      // Calculate current request count
      const currentRequests = requests.length

      // Check if exceeded
      const allowed = currentRequests < this.config.maxRequests
      const remaining = Math.max(
        0,
        this.config.maxRequests - currentRequests - 1
      )

      // If allowed, record this request
      if (allowed) {
        await this.recordRequest(key, now)
      }

      // Calculate reset time
      const oldestRequest = requests[0]
      const timeToReset = oldestRequest
        ? Math.max(0, oldestRequest + this.config.windowMs - now)
        : this.config.windowMs

      return {
        allowed,
        totalHits: currentRequests + (allowed ? 1 : 0),
        timeToReset,
        remaining: allowed ? remaining : 0,
      }
    } catch (error) {
      logger.error(`Rate limit check failed ${identifier}:`, error as Error)
      // Default to allowing the request when an error occurs
      return {
        allowed: true,
        totalHits: 1,
        timeToReset: this.config.windowMs,
        remaining: this.config.maxRequests - 1,
      }
    }
  }

  // Get requests in current window
  private async getRequestsInWindow(
    key: string,
    windowStart: number
  ): Promise<number[]> {
    const cached = await cacheService.get<number[]>(key)
    if (!cached) return []

    // Filter out requests outside the window
    return cached.filter(timestamp => timestamp > windowStart)
  }

  // Record request
  private async recordRequest(key: string, timestamp: number): Promise<void> {
    const requests = await this.getRequestsInWindow(
      key,
      timestamp - this.config.windowMs
    )
    requests.push(timestamp)

    // Only keep the most recent requests to avoid large arrays
    const maxRecords = Math.max(this.config.maxRequests * 2, 100)
    const trimmedRequests = requests.slice(-maxRecords)

    // Set expiration time to twice the window time to ensure data is not cleared too early
    const ttl = Math.ceil((this.config.windowMs / 1000) * 2)
    await cacheService.set(key, trimmedRequests, ttl)
  }

  // Reset rate limiter
  async reset(identifier: string): Promise<void> {
    const key = this.config.keyGenerator!(identifier)
    await cacheService.del(key)
  }

  // Get rate limit status
  async getStatus(identifier: string): Promise<{
    requests: number
    remaining: number
    resetTime: number
  }> {
    const key = this.config.keyGenerator!(identifier)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    const requests = await this.getRequestsInWindow(key, windowStart)
    const currentRequests = requests.length
    const remaining = Math.max(0, this.config.maxRequests - currentRequests)

    const oldestRequest = requests[0]
    const resetTime = oldestRequest
      ? oldestRequest + this.config.windowMs
      : now + this.config.windowMs

    return {
      requests: currentRequests,
      remaining,
      resetTime,
    }
  }
}

// Predefined rate limit configurations
export const RateLimitConfigs = {
  // Strict limit (e.g. login)
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'The request is too frequent, please try again later',
  },

  // General API limit
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'API request frequency is too high',
  },

  // Loose limit (e.g. data fetching)
  loose: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000,
    message: 'Request frequency is too high',
  },

  // Free user limit
  freeUser: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100,
    message: 'Free user request limit exceeded, please upgrade to a paid plan',
  },

  // Paid user limit
  paidUser: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000,
    message: 'Request frequency is too high, please try again later',
  },

  // Upload limit
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    message: 'Upload frequency is too high, please try again later',
  },
} as const

// Create a rate limiter instance
export const createRateLimiter = (config: RateLimitConfig) =>
  new RateLimiter(config)

// Predefined rate limiters
export const rateLimiters = {
  strict: createRateLimiter(RateLimitConfigs.strict),
  api: createRateLimiter(RateLimitConfigs.api),
  loose: createRateLimiter(RateLimitConfigs.loose),
  freeUser: createRateLimiter(RateLimitConfigs.freeUser),
  paidUser: createRateLimiter(RateLimitConfigs.paidUser),
  upload: createRateLimiter(RateLimitConfigs.upload),
}

// Rate limit middleware type
export type RateLimitMiddleware = (
  identifier: string,
  config?: Partial<RateLimitConfig>
) => Promise<RateLimitResult>

// General rate limiting middleware
export const rateLimit: RateLimitMiddleware = async (
  identifier: string,
  config = {}
) => {
  const limiter = createRateLimiter({
    ...RateLimitConfigs.api,
    ...config,
  })

  return limiter.checkLimit(identifier)
}

// IP rate limiting
export const rateLimitByIP = (ip: string, config?: Partial<RateLimitConfig>) =>
  rateLimit(`ip:${ip}`, config)

// User rate limiting
export const rateLimitByUser = (
  userId: string,
  config?: Partial<RateLimitConfig>
) => rateLimit(`user:${userId}`, config)

// API路径限流
export const rateLimitByPath = (
  ip: string,
  path: string,
  config?: Partial<RateLimitConfig>
) => rateLimit(`path:${ip}:${path}`, config)

// Global API rate limiting
export const rateLimitGlobal = (config?: Partial<RateLimitConfig>) =>
  rateLimit('global', config)

// User type rate limiting
export const rateLimitByUserType = async (
  userId: string,
  isPaidUser: boolean,
  config?: Partial<RateLimitConfig>
): Promise<RateLimitResult> => {
  const baseConfig = isPaidUser
    ? RateLimitConfigs.paidUser
    : RateLimitConfigs.freeUser
  return rateLimitByUser(userId, { ...baseConfig, ...config })
}

// Multi-level rate limiting (check multiple limits simultaneously)
export const multiLevelRateLimit = async (
  checks: Array<{
    identifier: string
    config?: Partial<RateLimitConfig>
    name?: string
  }>
): Promise<{
  allowed: boolean
  failedCheck?: string
  results: RateLimitResult[]
}> => {
  const results: RateLimitResult[] = []

  for (const check of checks) {
    const result = await rateLimit(check.identifier, check.config)
    results.push(result)

    if (!result.allowed) {
      return {
        allowed: false,
        failedCheck: check.name || check.identifier,
        results,
      }
    }
  }

  return {
    allowed: true,
    results,
  }
}

// Rate limiting decorator
export function RateLimit(config: RateLimitConfig) {
  return (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) => {
    const method = descriptor.value
    const limiter = createRateLimiter(config)

    descriptor.value = async function (...args: any[]) {
      // Try to extract identifier from arguments
      const identifier = args[0]?.userId || args[0]?.ip || 'anonymous'

      const result = await limiter.checkLimit(identifier)

      if (!result.allowed) {
        throw new Error(config.message || 'Rate limit exceeded')
      }

      return method.apply(this, args)
    }
  }
}

// Sliding window rate limiter (more precise rate limiting algorithm)
export class SlidingWindowRateLimiter {
  private windowMs: number
  private maxRequests: number
  private subWindowCount: number

  constructor(windowMs: number, maxRequests: number, subWindowCount = 10) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
    this.subWindowCount = subWindowCount
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const subWindowMs = this.windowMs / this.subWindowCount
    const currentWindow = Math.floor(now / subWindowMs)

    // Get the count of all child windows
    const promises = []
    for (let i = 0; i < this.subWindowCount; i++) {
      const windowKey = `sliding:${identifier}:${currentWindow - i}`
      promises.push(cacheService.get<number>(windowKey))
    }

    const counts = await Promise.all(promises)
    const totalRequests =
      counts.reduce((sum, count) => (sum || 0) + (count || 0), 0) || 0

    const allowed = totalRequests < this.maxRequests

    if (allowed) {
      // Log current request
      const currentWindowKey = `sliding:${identifier}:${currentWindow}`
      const currentCount =
        (await cacheService.get<number>(currentWindowKey)) || 0
      await cacheService.set(
        currentWindowKey,
        currentCount + 1,
        Math.ceil(this.windowMs / 1000)
      )
    }

    return {
      allowed,
      totalHits: (totalRequests || 0) + (allowed ? 1 : 0),
      timeToReset: subWindowMs - (now % subWindowMs),
      remaining: Math.max(
        0,
        this.maxRequests - (totalRequests || 0) - (allowed ? 1 : 0)
      ),
    }
  }
}

// Token bucket rate limiter
export class TokenBucketRateLimiter {
  private capacity: number
  private refillRate: number // Tokens added per second
  private refillPeriod: number // Refill period (milliseconds)

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity
    this.refillRate = refillRate
    this.refillPeriod = 1000 / refillRate // Refill interval for each token
  }

  async checkLimit(
    identifier: string,
    tokensRequested = 1
  ): Promise<RateLimitResult> {
    const key = `bucket:${identifier}`
    const now = Date.now()

    // Get the current bucket status
    const bucketData = (await cacheService.get<{
      tokens: number
      lastRefill: number
    }>(key)) || {
      tokens: this.capacity,
      lastRefill: now,
    }

    // Calculate tokens to refill
    const timePassed = now - bucketData.lastRefill
    const tokensToAdd = Math.floor(timePassed / this.refillPeriod)

    // Update the number of tokens (not exceeding capacity)
    const currentTokens = Math.min(
      this.capacity,
      bucketData.tokens + tokensToAdd
    )

    const allowed = currentTokens >= tokensRequested
    const newTokens = allowed ? currentTokens - tokensRequested : currentTokens

    // Save new state
    await cacheService.set(
      key,
      {
        tokens: newTokens,
        lastRefill: now,
      },
      3600
    ) // 1 hour expiration

    const timeToNextToken = allowed ? 0 : this.refillPeriod

    return {
      allowed,
      totalHits: this.capacity - newTokens,
      timeToReset: timeToNextToken,
      remaining: newTokens,
    }
  }
}

// Distributed rate limiter (supports multi-instance deployment)
export class DistributedRateLimiter {
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = `distributed:${identifier}`
    const now = Date.now()
    const windowStart = now - this.windowMs

    try {
      // Use Redis atomic operations to ensure distributed consistency
      // This is a simplified implementation, actual production environments may require Lua scripts
      const requestsKey = `${key}:requests`
      const requests = (await cacheService.get<number[]>(requestsKey)) || []

      // Clean up expired requests
      const validRequests = (requests || []).filter(
        timestamp => timestamp > windowStart
      )

      const allowed = validRequests.length < this.maxRequests

      if (allowed) {
        validRequests.push(now)
        await cacheService.set(
          requestsKey,
          validRequests,
          Math.ceil((this.windowMs / 1000) * 2)
        )
      }

      const timeToReset =
        validRequests.length > 0
          ? Math.max(0, (validRequests[0] || 0) + this.windowMs - now)
          : this.windowMs

      return {
        allowed,
        totalHits: validRequests.length,
        timeToReset,
        remaining: Math.max(0, this.maxRequests - validRequests.length),
      }
    } catch (error) {
      logger.error(
        `Distributed rate limit check failed ${identifier}:`,
        error as Error
      )
      // Default to allowed on error
      return {
        allowed: true,
        totalHits: 1,
        timeToReset: this.windowMs,
        remaining: this.maxRequests - 1,
      }
    }
  }
}

// Adaptive rate limiter (adjusts limits based on system load)
export class AdaptiveRateLimiter {
  private baseLimit: number
  private windowMs: number
  private adaptiveFactor: number

  constructor(baseLimit: number, windowMs: number, adaptiveFactor = 0.1) {
    this.baseLimit = baseLimit
    this.windowMs = windowMs
    this.adaptiveFactor = adaptiveFactor
  }

  async checkLimit(
    identifier: string,
    systemLoad = 0.5 // Between 0 and 1, indicating system load
  ): Promise<RateLimitResult> {
    // Adjust limit based on system load
    const adjustedLimit = Math.floor(
      this.baseLimit * (1 - systemLoad * this.adaptiveFactor)
    )

    const limiter = createRateLimiter({
      windowMs: this.windowMs,
      maxRequests: adjustedLimit,
      keyGenerator: id => `adaptive:${id}`,
    })

    return limiter.checkLimit(identifier)
  }
}

// Rate limiting utility functions
export const RateLimitUtils = {
  // Get client IP
  getClientIP: (request: Request): string => {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const remoteAddr = request.headers.get('remote-addr')

    return forwarded?.split(',')[0] || realIP || remoteAddr || 'unknown'
  },

  // Generate rate limit response headers
  generateHeaders: (result: RateLimitResult, config: RateLimitConfig) => ({
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(
      Date.now() + result.timeToReset
    ).toISOString(),
    'Retry-After': Math.ceil(result.timeToReset / 1000).toString(),
  }),

  // Format rate limit error messages
  formatError: (result: RateLimitResult, config: RateLimitConfig) => ({
    error: config.message || 'Too many requests',
    limit: config.maxRequests,
    remaining: result.remaining,
    resetTime: new Date(Date.now() + result.timeToReset).toISOString(),
  }),
}
