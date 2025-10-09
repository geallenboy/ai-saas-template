import { Redis } from '@upstash/redis'
import { env } from '@/env'
import { logger } from '@/lib/logger'

// 缓存配置
interface CacheConfig {
  ttl: number // 默认过期时间（秒）
  keyPrefix: string // 键前缀
}

// 缓存项接口
interface CacheItem<T = any> {
  value: T
  createdAt: number
  expiresAt?: number
}

// 缓存服务类
class CacheService {
  private redis?: Redis
  private memoryCache: Map<string, CacheItem> = new Map()
  private useMemoryFallback = false
  private config: CacheConfig = {
    ttl: 3600, // 1小时
    keyPrefix: 'ai-saas:',
  }

  constructor() {
    this.initializeRedis()
  }

  // 初始化Redis连接
  private initializeRedis() {
    try {
      if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
        this.redis = new Redis({
          url: env.UPSTASH_REDIS_REST_URL,
          token: env.UPSTASH_REDIS_REST_TOKEN,
        })
        logger.info('Redis缓存服务初始化成功')
      } else {
        this.useMemoryFallback = true
        logger.warn('Redis未配置，使用内存缓存作为后备')
      }
    } catch (error) {
      this.useMemoryFallback = true
      logger.error('Redis初始化失败，使用内存缓存:', error as Error)
    }
  }

  // 生成缓存键
  private generateKey(key: string): string {
    return `${this.config.keyPrefix}${key}`
  }

  // 设置缓存
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const fullKey = this.generateKey(key)
    const expirationTime = ttl || this.config.ttl

    try {
      if (this.redis && !this.useMemoryFallback) {
        // 使用Redis
        await this.redis.setex(fullKey, expirationTime, JSON.stringify(value))
      } else {
        // 使用内存缓存
        const expiresAt = Date.now() + expirationTime * 1000
        this.memoryCache.set(fullKey, {
          value,
          createdAt: Date.now(),
          expiresAt,
        })
        this.cleanupExpiredMemoryCache()
      }
    } catch (error) {
      logger.error(`缓存设置失败 ${key}:`, error as Error)
      throw error
    }
  }

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.generateKey(key)

    try {
      if (this.redis && !this.useMemoryFallback) {
        // 使用Redis
        const result = await this.redis.get(fullKey)
        return result ? JSON.parse(result as string) : null
      } else {
        // 使用内存缓存
        const item = this.memoryCache.get(fullKey)
        if (!item) return null

        // 检查是否过期
        if (item.expiresAt && Date.now() > item.expiresAt) {
          this.memoryCache.delete(fullKey)
          return null
        }

        return item.value
      }
    } catch (error) {
      logger.error(`缓存获取失败 ${key}:`, error as Error)
      return null
    }
  }

  // 删除缓存
  async del(key: string): Promise<boolean> {
    const fullKey = this.generateKey(key)

    try {
      if (this.redis && !this.useMemoryFallback) {
        const result = await this.redis.del(fullKey)
        return result > 0
      } else {
        return this.memoryCache.delete(fullKey)
      }
    } catch (error) {
      logger.error(`缓存删除失败 ${key}:`, error as Error)
      return false
    }
  }

  // 检查缓存是否存在
  async exists(key: string): Promise<boolean> {
    const fullKey = this.generateKey(key)

    try {
      if (this.redis && !this.useMemoryFallback) {
        const result = await this.redis.exists(fullKey)
        return result > 0
      } else {
        const item = this.memoryCache.get(fullKey)
        if (!item) return false

        if (item.expiresAt && Date.now() > item.expiresAt) {
          this.memoryCache.delete(fullKey)
          return false
        }

        return true
      }
    } catch (error) {
      logger.error(`缓存检查失败 ${key}:`, error as Error)
      return false
    }
  }

  // 设置过期时间
  async expire(key: string, seconds: number): Promise<boolean> {
    const fullKey = this.generateKey(key)

    try {
      if (this.redis && !this.useMemoryFallback) {
        const result = await this.redis.expire(fullKey, seconds)
        return result === 1
      } else {
        const item = this.memoryCache.get(fullKey)
        if (item) {
          item.expiresAt = Date.now() + seconds * 1000
          return true
        }
        return false
      }
    } catch (error) {
      logger.error(`设置过期时间失败 ${key}:`, error as Error)
      return false
    }
  }

  // 获取剩余过期时间
  async ttl(key: string): Promise<number> {
    const fullKey = this.generateKey(key)

    try {
      if (this.redis && !this.useMemoryFallback) {
        return await this.redis.ttl(fullKey)
      } else {
        const item = this.memoryCache.get(fullKey)
        if (!item?.expiresAt) return -1

        const remaining = Math.floor((item.expiresAt - Date.now()) / 1000)
        return remaining > 0 ? remaining : -2
      }
    } catch (error) {
      logger.error(`获取TTL失败 ${key}:`, error as Error)
      return -1
    }
  }

  // 批量获取
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const fullKeys = keys.map(k => this.generateKey(k))

    try {
      if (this.redis && !this.useMemoryFallback) {
        const results = await this.redis.mget(...fullKeys)
        return results.map(result =>
          result ? JSON.parse(result as string) : null
        )
      } else {
        return fullKeys.map(key => {
          const item = this.memoryCache.get(key)
          if (!item) return null

          if (item.expiresAt && Date.now() > item.expiresAt) {
            this.memoryCache.delete(key)
            return null
          }

          return item.value
        })
      }
    } catch (error) {
      logger.error('批量获取缓存失败:', error as Error)
      return keys.map(() => null)
    }
  }

  // 批量设置
  async mset(
    pairs: Array<{ key: string; value: any; ttl?: number }>
  ): Promise<void> {
    try {
      if (this.redis && !this.useMemoryFallback) {
        // Redis批量设置
        const pipeline = this.redis.pipeline()
        pairs.forEach(({ key, value, ttl }) => {
          const fullKey = this.generateKey(key)
          const expirationTime = ttl || this.config.ttl
          pipeline.setex(fullKey, expirationTime, JSON.stringify(value))
        })
        await pipeline.exec()
      } else {
        // 内存缓存批量设置
        pairs.forEach(({ key, value, ttl }) => {
          const fullKey = this.generateKey(key)
          const expirationTime = ttl || this.config.ttl
          const expiresAt = Date.now() + expirationTime * 1000
          this.memoryCache.set(fullKey, {
            value,
            createdAt: Date.now(),
            expiresAt,
          })
        })
        this.cleanupExpiredMemoryCache()
      }
    } catch (error) {
      logger.error('批量设置缓存失败:', error as Error)
      throw error
    }
  }

  // 清理过期的内存缓存
  private cleanupExpiredMemoryCache() {
    const now = Date.now()
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        this.memoryCache.delete(key)
      }
    }
  }

  // 清空所有缓存
  async flush(): Promise<void> {
    try {
      if (this.redis && !this.useMemoryFallback) {
        await this.redis.flushall()
      } else {
        this.memoryCache.clear()
      }
      logger.info('缓存清空成功')
    } catch (error) {
      logger.error('清空缓存失败:', error as Error)
      throw error
    }
  }

  // 获取缓存统计信息
  async getStats(): Promise<{
    type: string
    keyCount: number
    memoryUsage?: number
  }> {
    try {
      if (this.redis && !this.useMemoryFallback) {
        const keyCount = await this.redis.dbsize()
        return {
          type: 'redis',
          keyCount,
        }
      } else {
        this.cleanupExpiredMemoryCache()
        return {
          type: 'memory',
          keyCount: this.memoryCache.size,
          memoryUsage: this.estimateMemoryUsage(),
        }
      }
    } catch (error) {
      logger.error('获取缓存统计失败:', error as Error)
      return {
        type: this.useMemoryFallback ? 'memory' : 'redis',
        keyCount: 0,
      }
    }
  }

  // 估算内存使用量
  private estimateMemoryUsage(): number {
    let totalSize = 0
    for (const [key, item] of this.memoryCache.entries()) {
      totalSize += key.length * 2 // Unicode字符占2字节
      totalSize += JSON.stringify(item).length * 2
    }
    return totalSize
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    try {
      const testKey = 'health-check'
      const testValue = { timestamp: Date.now() }

      await this.set(testKey, testValue, 60)
      const result = await this.get(testKey)
      await this.del(testKey)

      return !!result && (result as any).timestamp === testValue.timestamp
    } catch (error) {
      logger.error('缓存健康检查失败:', error as Error)
      return false
    }
  }
}

// 创建缓存服务实例
export const cacheService = new CacheService()

// 便捷方法
export const cache = {
  set: <T>(key: string, value: T, ttl?: number) =>
    cacheService.set(key, value, ttl),
  get: <T>(key: string) => cacheService.get<T>(key),
  del: (key: string) => cacheService.del(key),
  exists: (key: string) => cacheService.exists(key),
  expire: (key: string, seconds: number) => cacheService.expire(key, seconds),
  ttl: (key: string) => cacheService.ttl(key),
  mget: <T>(keys: string[]) => cacheService.mget<T>(keys),
  mset: (pairs: Array<{ key: string; value: any; ttl?: number }>) =>
    cacheService.mset(pairs),
  flush: () => cacheService.flush(),
  stats: () => cacheService.getStats(),
  health: () => cacheService.healthCheck(),
}

// 缓存装饰器
export function Cached(key: string, ttl?: number) {
  return (
    _target: any,
    _propertyName: string,
    descriptor: PropertyDescriptor
  ) => {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${key}:${JSON.stringify(args)}`

      // 尝试从缓存获取
      const cached = await cache.get(cacheKey)
      if (cached !== null) {
        return cached
      }

      // 执行原方法
      const result = await method.apply(this, args)

      // 存入缓存
      if (result !== null && result !== undefined) {
        await cache.set(cacheKey, result, ttl)
      }

      return result
    }
  }
}

// 缓存帮助函数
export const withCache = async <T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  const cached = await cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  const result = await fn()
  if (result !== null && result !== undefined) {
    await cache.set(key, result, ttl)
  }

  return result
}

// 缓存键生成器
export const generateCacheKey = (...parts: (string | number)[]): string => {
  return parts.join(':')
}

// 常用缓存键
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userMembership: (userId: string) => `user:${userId}:membership`,
  membershipPlans: () => 'membership-plans',
  userStats: (userId: string) => `user:${userId}:stats`,
  paymentHistory: (userId: string, page: number) =>
    `user:${userId}:payments:${page}`,
  usageLimit: (userId: string) => `user:${userId}:usage-limit`,
  sessionCount: (userId: string) => `sessions:${userId}`,
} as const

// 批量清理用户相关缓存
export const clearUserCache = async (userId: string): Promise<void> => {
  const keys = [
    CacheKeys.user(userId),
    CacheKeys.userMembership(userId),
    CacheKeys.userStats(userId),
    CacheKeys.usageLimit(userId),
  ]

  await Promise.all(keys.map(key => cache.del(key)))
}

// 预热缓存
export const warmupCache = async (): Promise<void> => {
  try {
    // 预热会员计划
    // await cache.set(CacheKeys.membershipPlans(), await getMembershipPlans(), 3600)

    logger.info('缓存预热完成')
  } catch (error) {
    logger.error('缓存预热失败:', error as Error)
  }
}
