import { cacheService } from '@/lib/cache'
import { logger } from '@/lib/logger'

// 限流配置接口
interface RateLimitConfig {
  windowMs: number // 时间窗口（毫秒）
  maxRequests: number // 最大请求数
  message?: string // 超限消息
  skipSuccessfulRequests?: boolean // 是否跳过成功请求
  skipFailedRequests?: boolean // 是否跳过失败请求
  keyGenerator?: (identifier: string) => string // 自定义键生成器
}

// 限流结果接口
interface RateLimitResult {
  allowed: boolean // 是否允许
  totalHits: number // 总请求数
  timeToReset: number // 重置时间（毫秒）
  remaining: number // 剩余请求数
}

// 限流器类
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

  private resolveKey(identifier: string) {
    const generator =
      this.config.keyGenerator ?? ((value: string) => `rate-limit:${value}`)
    return generator(identifier)
  }

  // 检查并记录请求
  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = this.resolveKey(identifier)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    try {
      // 获取当前窗口内的请求记录
      const requests = await this.getRequestsInWindow(key, windowStart)

      // 计算当前请求数
      const currentRequests = requests.length

      // 检查是否超限
      const allowed = currentRequests < this.config.maxRequests
      const remaining = Math.max(
        0,
        this.config.maxRequests - currentRequests - 1
      )

      // 如果允许，记录这次请求
      if (allowed) {
        await this.recordRequest(key, now)
      }

      // 计算重置时间
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
      logger.error(`限流检查失败 ${identifier}:`, error as Error)
      // 出错时默认允许请求
      return {
        allowed: true,
        totalHits: 1,
        timeToReset: this.config.windowMs,
        remaining: this.config.maxRequests - 1,
      }
    }
  }

  // 获取窗口内的请求记录
  private async getRequestsInWindow(
    key: string,
    windowStart: number
  ): Promise<number[]> {
    const cached = await cacheService.get<number[]>(key)
    if (!cached) return []

    // 过滤掉窗口外的请求
    return cached.filter(timestamp => timestamp > windowStart)
  }

  // 记录请求
  private async recordRequest(key: string, timestamp: number): Promise<void> {
    const requests = await this.getRequestsInWindow(
      key,
      timestamp - this.config.windowMs
    )
    requests.push(timestamp)

    // 只保留最近的请求记录，避免数组过大
    const maxRecords = Math.max(this.config.maxRequests * 2, 100)
    const trimmedRequests = requests.slice(-maxRecords)

    // 设置过期时间为窗口时间的2倍，确保数据不会过早清除
    const ttl = Math.ceil((this.config.windowMs / 1000) * 2)
    await cacheService.set(key, trimmedRequests, ttl)
  }

  // 重置限流器
  async reset(identifier: string): Promise<void> {
    const key = this.resolveKey(identifier)
    await cacheService.del(key)
  }

  // 获取限流状态
  async getStatus(identifier: string): Promise<{
    requests: number
    remaining: number
    resetTime: number
  }> {
    const key = this.resolveKey(identifier)
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

// 预定义的限流配置
export const RateLimitConfigs = {
  // 严格限制（如登录）
  strict: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 5,
    message: '请求过于频繁，请稍后再试',
  },

  // 一般API限制
  api: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 100,
    message: 'API请求频率过高',
  },

  // 宽松限制（如获取数据）
  loose: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 1000,
    message: '请求频率过高',
  },

  // 免费用户限制
  freeUser: {
    windowMs: 60 * 60 * 1000, // 1小时
    maxRequests: 100,
    message: '免费用户请求限制，请升级到付费计划',
  },

  // 付费用户限制
  paidUser: {
    windowMs: 60 * 60 * 1000, // 1小时
    maxRequests: 1000,
    message: '请求频率过高，请稍后再试',
  },

  // 上传限制
  upload: {
    windowMs: 60 * 60 * 1000, // 1小时
    maxRequests: 50,
    message: '上传频率过高，请稍后再试',
  },
} as const

// 创建限流器实例
export const createRateLimiter = (config: RateLimitConfig) =>
  new RateLimiter(config)

// 预定义的限流器
export const rateLimiters = {
  strict: createRateLimiter(RateLimitConfigs.strict),
  api: createRateLimiter(RateLimitConfigs.api),
  loose: createRateLimiter(RateLimitConfigs.loose),
  freeUser: createRateLimiter(RateLimitConfigs.freeUser),
  paidUser: createRateLimiter(RateLimitConfigs.paidUser),
  upload: createRateLimiter(RateLimitConfigs.upload),
}

// 限流中间件类型
export type RateLimitMiddleware = (
  identifier: string,
  config?: Partial<RateLimitConfig>
) => Promise<RateLimitResult>

// 通用限流中间件
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

// IP限流
export const rateLimitByIP = (ip: string, config?: Partial<RateLimitConfig>) =>
  rateLimit(`ip:${ip}`, config)

// 用户限流
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

// 全局API限流
export const rateLimitGlobal = (config?: Partial<RateLimitConfig>) =>
  rateLimit('global', config)

// 根据用户类型限流
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

// 多级限流（同时检查多个限制）
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

// 限流装饰器
export function RateLimit(config: RateLimitConfig) {
  return (
    _target: any,
    _propertyName: string,
    descriptor: PropertyDescriptor
  ) => {
    const method = descriptor.value
    const limiter = createRateLimiter(config)

    descriptor.value = async function (...args: any[]) {
      // 尝试从参数中提取标识符
      const identifier = args[0]?.userId || args[0]?.ip || 'anonymous'

      const result = await limiter.checkLimit(identifier)

      if (!result.allowed) {
        throw new Error(config.message || 'Rate limit exceeded')
      }

      return method.apply(this, args)
    }
  }
}

// 滑动窗口限流器（更精确的限流算法）
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

    // 获取所有子窗口的计数
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
      // 记录当前请求
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

// 令牌桶限流器
export class TokenBucketRateLimiter {
  private capacity: number
  private refillPeriod: number // 补充周期（毫秒）

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity
    this.refillPeriod = 1000 / refillRate // 每个令牌的补充间隔
  }

  async checkLimit(
    identifier: string,
    tokensRequested = 1
  ): Promise<RateLimitResult> {
    const key = `bucket:${identifier}`
    const now = Date.now()

    // 获取当前桶状态
    const bucketData = (await cacheService.get<{
      tokens: number
      lastRefill: number
    }>(key)) || {
      tokens: this.capacity,
      lastRefill: now,
    }

    // 计算需要补充的令牌数
    const timePassed = now - bucketData.lastRefill
    const tokensToAdd = Math.floor(timePassed / this.refillPeriod)

    // 更新令牌数（不超过容量）
    const currentTokens = Math.min(
      this.capacity,
      bucketData.tokens + tokensToAdd
    )

    const allowed = currentTokens >= tokensRequested
    const newTokens = allowed ? currentTokens - tokensRequested : currentTokens

    // 保存新状态
    await cacheService.set(
      key,
      {
        tokens: newTokens,
        lastRefill: now,
      },
      3600
    ) // 1小时过期

    const timeToNextToken = allowed ? 0 : this.refillPeriod

    return {
      allowed,
      totalHits: this.capacity - newTokens,
      timeToReset: timeToNextToken,
      remaining: newTokens,
    }
  }
}

// 分布式限流器（支持多实例部署）
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
      // 使用Redis的原子操作保证分布式一致性
      // 这里简化实现，实际生产环境可能需要Lua脚本
      const requestsKey = `${key}:requests`
      const requests = (await cacheService.get<number[]>(requestsKey)) || []

      // 清理过期请求
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
      logger.error(`分布式限流检查失败 ${identifier}:`, error as Error)
      // 出错时默认允许
      return {
        allowed: true,
        totalHits: 1,
        timeToReset: this.windowMs,
        remaining: this.maxRequests - 1,
      }
    }
  }
}

// 自适应限流器（根据系统负载调整限制）
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
    systemLoad = 0.5 // 0-1之间，表示系统负载
  ): Promise<RateLimitResult> {
    // 根据系统负载调整限制
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

// 限流工具函数
export const RateLimitUtils = {
  // 获取客户端IP
  getClientIP: (request: Request): string => {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const remoteAddr = request.headers.get('remote-addr')

    return forwarded?.split(',')[0] || realIP || remoteAddr || 'unknown'
  },

  // 生成限流响应头
  generateHeaders: (result: RateLimitResult, config: RateLimitConfig) => ({
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(
      Date.now() + result.timeToReset
    ).toISOString(),
    'Retry-After': Math.ceil(result.timeToReset / 1000).toString(),
  }),

  // 格式化限流错误消息
  formatError: (result: RateLimitResult, config: RateLimitConfig) => ({
    error: config.message || 'Too many requests',
    limit: config.maxRequests,
    remaining: result.remaining,
    resetTime: new Date(Date.now() + result.timeToReset).toISOString(),
  }),
}
