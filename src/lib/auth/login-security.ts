import { cacheService } from '@/lib/cache'
import { logger } from '@/lib/logger'

// ============================================================
// 登录安全服务 - IP 限流 + 账户锁定
// ============================================================

/** 登录检查结果 */
export interface LoginCheckResult {
    allowed: boolean
    remainingAttempts: number
    lockUntil?: Date
}

/** 登录安全服务接口 */
export interface LoginSecurityService {
    checkLoginAttempts(email: string, ip: string): Promise<LoginCheckResult>
    recordLoginAttempt(
        email: string,
        ip: string,
        success: boolean
    ): Promise<void>
    lockAccount(email: string, durationMinutes: number): Promise<void>
    isAccountLocked(email: string): Promise<boolean>
}

// 常量配置
const MAX_FAILED_ATTEMPTS = 5
const LOCK_DURATION_MINUTES = 15
const ATTEMPT_WINDOW_SECONDS = 15 * 60 // 15 分钟窗口

// 缓存键前缀
const KEY_PREFIX = {
    loginAttempts: 'login-security:attempts:',
    accountLock: 'login-security:lock:',
}

/**
 * 获取账户登录失败次数的缓存键
 */
function getAttemptsKey(email: string): string {
    return `${KEY_PREFIX.loginAttempts}${email}`
}

/**
 * 获取账户锁定状态的缓存键
 */
function getLockKey(email: string): string {
    return `${KEY_PREFIX.accountLock}${email}`
}

/**
 * 检查登录尝试是否被允许
 *
 * 检查顺序：
 * 1. 检查账户是否被锁定
 * 2. 检查失败次数是否达到阈值
 */
export async function checkLoginAttempts(
    email: string,
    _ip: string
): Promise<LoginCheckResult> {
    try {
        // 1. 检查账户是否被锁定
        const lockData = await cacheService.get<{ lockedUntil: number }>(
            getLockKey(email)
        )

        if (lockData) {
            const lockUntil = new Date(lockData.lockedUntil)
            if (lockUntil.getTime() > Date.now()) {
                return {
                    allowed: false,
                    remainingAttempts: 0,
                    lockUntil,
                }
            }
            // 锁定已过期，清除锁定记录
            await cacheService.del(getLockKey(email))
        }

        // 2. 检查失败次数
        const failedAttempts =
            (await cacheService.get<number>(getAttemptsKey(email))) || 0

        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            // 达到阈值，自动锁定账户
            await lockAccount(email, LOCK_DURATION_MINUTES)
            const lockUntil = new Date(
                Date.now() + LOCK_DURATION_MINUTES * 60 * 1000
            )
            return {
                allowed: false,
                remainingAttempts: 0,
                lockUntil,
            }
        }

        return {
            allowed: true,
            remainingAttempts: MAX_FAILED_ATTEMPTS - failedAttempts,
        }
    } catch (error) {
        logger.error('检查登录尝试失败:', error as Error)
        // 出错时默认允许登录，避免阻塞用户
        return {
            allowed: true,
            remainingAttempts: MAX_FAILED_ATTEMPTS,
        }
    }
}

/**
 * 记录登录尝试
 *
 * - 成功登录：清除失败计数
 * - 失败登录：增加失败计数，达到阈值时自动锁定
 */
export async function recordLoginAttempt(
    email: string,
    _ip: string,
    success: boolean
): Promise<void> {
    try {
        if (success) {
            // 登录成功，清除失败计数
            await cacheService.del(getAttemptsKey(email))
            return
        }

        // 登录失败，增加失败计数
        const currentAttempts =
            (await cacheService.get<number>(getAttemptsKey(email))) || 0
        const newAttempts = currentAttempts + 1

        await cacheService.set(
            getAttemptsKey(email),
            newAttempts,
            ATTEMPT_WINDOW_SECONDS
        )

        logger.warn('登录失败记录', {
            email,
            failedAttempts: newAttempts,
            maxAttempts: MAX_FAILED_ATTEMPTS,
        })

        // 达到阈值，自动锁定
        if (newAttempts >= MAX_FAILED_ATTEMPTS) {
            await lockAccount(email, LOCK_DURATION_MINUTES)
            logger.warn('账户已被自动锁定', {
                email,
                durationMinutes: LOCK_DURATION_MINUTES,
            })
        }
    } catch (error) {
        logger.error('记录登录尝试失败:', error as Error)
    }
}

/**
 * 锁定账户
 */
export async function lockAccount(
    email: string,
    durationMinutes: number
): Promise<void> {
    try {
        const lockedUntil = Date.now() + durationMinutes * 60 * 1000
        await cacheService.set(
            getLockKey(email),
            { lockedUntil },
            durationMinutes * 60
        )
        logger.info('账户已锁定', { email, durationMinutes, lockedUntil })
    } catch (error) {
        logger.error('锁定账户失败:', error as Error)
    }
}

/**
 * 检查账户是否被锁定
 */
export async function isAccountLocked(email: string): Promise<boolean> {
    try {
        const lockData = await cacheService.get<{ lockedUntil: number }>(
            getLockKey(email)
        )

        if (!lockData) return false

        if (lockData.lockedUntil > Date.now()) {
            return true
        }

        // 锁定已过期，清除
        await cacheService.del(getLockKey(email))
        return false
    } catch (error) {
        logger.error('检查账户锁定状态失败:', error as Error)
        return false
    }
}

/**
 * 登录安全服务实例（对象形式，方便集成）
 */
export const loginSecurityService: LoginSecurityService = {
    checkLoginAttempts,
    recordLoginAttempt,
    lockAccount,
    isAccountLocked,
}

// 导出常量供测试使用
export const LOGIN_SECURITY_CONFIG = {
    MAX_FAILED_ATTEMPTS,
    LOCK_DURATION_MINUTES,
    ATTEMPT_WINDOW_SECONDS,
} as const
