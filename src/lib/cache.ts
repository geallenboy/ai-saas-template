import { env } from '@/env'
import { logger } from '@/lib/logger'
import { Redis } from '@upstash/redis'

// Cache configuration
interface CacheConfig {
  ttl: number // Default expiration time (seconds)
  keyPrefix: string // Key prefix
}

// Cache item interface
interface CacheItem<T = any> {
  value: T
  createdAt: number
  expiresAt?: number
}

// Cache service class
class CacheService {
  private redis?: Redis
  private memoryCache: Map<string, CacheItem> = new Map()
  private useMemoryFallback = false
  private config: CacheConfig = {
    ttl: 3600, // 1 hour
    keyPrefix: 'ai-saas:',
  }

  constructor() {
    this.initializeRedis()
  }

  // Initialize Redis connection
  private initializeRedis() {
    try {
      if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
        this.redis = new Redis({
          url: env.UPSTASH_REDIS_REST_URL,
          token: env.UPSTASH_REDIS_REST_TOKEN,
        })
        logger.info('Redis cache service initialized successfully')
      } else {
        this.useMemoryFallback = true
        logger.warn(
          'Redis is not configured, using in-memory cache as fallback'
        )
      }
    } catch (error) {
      this.useMemoryFallback = true
      logger.error(
        'Failed to initialize Redis, using in-memory cache:',
        error as Error
      )
    }
  }

  // Generate cache key
  private generateKey(key: string): string {
    return `${this.config.keyPrefix}${key}`
  }

  // Set cache
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const fullKey = this.generateKey(key)
    const expirationTime = ttl || this.config.ttl

    try {
      if (this.redis && !this.useMemoryFallback) {
        // Use Redis
        await this.redis.setex(fullKey, expirationTime, JSON.stringify(value))
      } else {
        // Use in-memory cache
        const expiresAt = Date.now() + expirationTime * 1000
        this.memoryCache.set(fullKey, {
          value,
          createdAt: Date.now(),
          expiresAt,
        })
        this.cleanupExpiredMemoryCache()
      }
    } catch (error) {
      logger.error(`Cache setup failed ${key}:`, error as Error)
      throw error
    }
  }

  // Get cache
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.generateKey(key)

    try {
      if (this.redis && !this.useMemoryFallback) {
        // Using Redis
        const result = await this.redis.get(fullKey)
        return result ? JSON.parse(result as string) : null
      } else {
        // Using in-memory cache
        const item = this.memoryCache.get(fullKey)
        if (!item) return null

        // Check if expired
        if (item.expiresAt && Date.now() > item.expiresAt) {
          this.memoryCache.delete(fullKey)
          return null
        }

        return item.value
      }
    } catch (error) {
      logger.error(`Cache retrieval failed ${key}:`, error as Error)
      return null
    }
  }

  // Delete cache
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
      logger.error(`Cache deletion failed ${key}:`, error as Error)
      return false
    }
  }

  // Check if cache exists
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
      logger.error(`Cache existence check failed ${key}:`, error as Error)
      return false
    }
  }

  // Set expiration time
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
      logger.error(`Failed to set expiration time ${key}:`, error as Error)
      return false
    }
  }

  // Get remaining expiration time
  async ttl(key: string): Promise<number> {
    const fullKey = this.generateKey(key)

    try {
      if (this.redis && !this.useMemoryFallback) {
        return await this.redis.ttl(fullKey)
      } else {
        const item = this.memoryCache.get(fullKey)
        if (!item || !item.expiresAt) return -1

        const remaining = Math.floor((item.expiresAt - Date.now()) / 1000)
        return remaining > 0 ? remaining : -2
      }
    } catch (error) {
      logger.error(`Failed to get TTL ${key}:`, error as Error)
      return -1
    }
  }

  // Batch get
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
      logger.error('Batch cache retrieval failed:', error as Error)
      return keys.map(() => null)
    }
  }

  // Batch set
  async mset(
    pairs: Array<{ key: string; value: any; ttl?: number }>
  ): Promise<void> {
    try {
      if (this.redis && !this.useMemoryFallback) {
        // Use Redis for batch set
        const pipeline = this.redis.pipeline()
        pairs.forEach(({ key, value, ttl }) => {
          const fullKey = this.generateKey(key)
          const expirationTime = ttl || this.config.ttl
          pipeline.setex(fullKey, expirationTime, JSON.stringify(value))
        })
        await pipeline.exec()
      } else {
        // Use in-memory cache for batch set
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
      logger.error('Batch cache setup failed:', error as Error)
      throw error
    }
  }

  // Clean up expired memory cache
  private cleanupExpiredMemoryCache() {
    const now = Date.now()
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        this.memoryCache.delete(key)
      }
    }
  }

  // Flush all cache
  async flush(): Promise<void> {
    try {
      if (this.redis && !this.useMemoryFallback) {
        await this.redis.flushall()
      } else {
        this.memoryCache.clear()
      }
      logger.info('Cache flushed successfully')
    } catch (error) {
      logger.error('Failed to flush cache:', error as Error)
      throw error
    }
  }

  // Get cache statistics
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
      logger.error('Failed to get cache statistics:', error as Error)
      return {
        type: this.useMemoryFallback ? 'memory' : 'redis',
        keyCount: 0,
      }
    }
  }

  // Estimate memory usage
  private estimateMemoryUsage(): number {
    let totalSize = 0
    for (const [key, item] of this.memoryCache.entries()) {
      totalSize += key.length * 2 // Unicode characters take up 2 bytes
      totalSize += JSON.stringify(item).length * 2
    }
    return totalSize
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const testKey = 'health-check'
      const testValue = { timestamp: Date.now() }

      await this.set(testKey, testValue, 60)
      const result = await this.get(testKey)
      await this.del(testKey)

      return !!result && (result as any).timestamp === testValue.timestamp
    } catch (error) {
      logger.error('Failed to perform health check:', error as Error)
      return false
    }
  }
}

// Create a cache service instance
export const cacheService = new CacheService()

// Convenience methods
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

// cache decorator
export function Cached(key: string, ttl?: number) {
  return (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) => {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${key}:${JSON.stringify(args)}`

      // Try to get it from cache
      const cached = await cache.get(cacheKey)
      if (cached !== null) {
        return cached
      }

      // Execute original method
      const result = await method.apply(this, args)

      // Store in cache
      if (result !== null && result !== undefined) {
        await cache.set(cacheKey, result, ttl)
      }

      return result
    }
  }
}

// Cache helper function
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

// Cache key generator
export const generateCacheKey = (...parts: (string | number)[]): string => {
  return parts.join(':')
}

// Common cache keys
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

// Batch clear user-related cache
export const clearUserCache = async (userId: string): Promise<void> => {
  const keys = [
    CacheKeys.user(userId),
    CacheKeys.userMembership(userId),
    CacheKeys.userStats(userId),
    CacheKeys.usageLimit(userId),
  ]

  await Promise.all(keys.map(key => cache.del(key)))
}

// Warm up cache
export const warmupCache = async (): Promise<void> => {
  try {
    // Warm up membership plans
    // await cache.set(CacheKeys.membershipPlans(), await getMembershipPlans(), 3600)

    logger.info('Cache warmed up successfully')
  } catch (error) {
    logger.error('Failed to warm up cache:', error as Error)
  }
}
