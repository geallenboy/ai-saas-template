'use server'

import { eq } from 'drizzle-orm'
import { cache } from 'react'
import { users } from '@/drizzle/schemas'
import { db } from '@/lib/db'
import { AdminLevel } from './roles'
import { auth } from './server'

// ===============================
// 权限检查函数
// ===============================

/**
 * 获取当前用户会话（缓存版本）
 */
export const getCurrentSession = cache(async () => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(),
    })
    return session
  } catch (error) {
    console.error('获取会话失败:', error)
    return null
  }
})

/**
 * 获取当前用户信息（包含数据库扩展信息）
 */
export const getCurrentUser = cache(async () => {
  const session = await getCurrentSession()
  if (!session?.user) return null

  try {
    // 从数据库获取完整用户信息
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    })

    return user
      ? {
          ...session.user,
          ...user,
          // 解析 preferences JSON 字符串
          preferences: user.preferences
            ? typeof user.preferences === 'string'
              ? JSON.parse(user.preferences)
              : user.preferences
            : null,
        }
      : session.user
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return session.user
  }
})

/**
 * 检查用户是否为管理员
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  return (user.adminLevel ?? AdminLevel.USER) >= AdminLevel.ADMIN
}

/**
 * 检查用户是否为超级管理员
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  return (user.adminLevel ?? AdminLevel.USER) >= AdminLevel.SUPER_ADMIN
}

// ===============================
// 权限管理函数
// ===============================

/**
 * 提升用户权限级别
 */
export async function promoteUser(
  userId: string,
  newLevel: AdminLevel
): Promise<void> {
  const currentUser = await getCurrentUser()
  if (!(currentUser && (await isSuperAdmin()))) {
    throw new Error('只有超级管理员可以提升用户权限')
  }

  await db
    .update(users)
    .set({
      adminLevel: newLevel,
      isAdmin: newLevel >= AdminLevel.ADMIN,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}

/**
 * 降级用户权限
 */
export async function demoteUser(
  userId: string,
  newLevel: AdminLevel
): Promise<void> {
  const currentUser = await getCurrentUser()
  if (!(currentUser && (await isSuperAdmin()))) {
    throw new Error('只有超级管理员可以降级用户权限')
  }

  // 防止降级自己
  if (userId === currentUser.id) {
    throw new Error('不能降级自己的权限')
  }

  await db
    .update(users)
    .set({
      adminLevel: newLevel,
      isAdmin: newLevel >= AdminLevel.ADMIN,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}

/**
 * 激活/禁用用户
 */
export async function toggleUserStatus(
  userId: string,
  isActive: boolean
): Promise<void> {
  const currentUser = await getCurrentUser()
  if (!(currentUser && (await isAdmin()))) {
    throw new Error('需要管理员权限')
  }

  // 防止禁用自己
  if (userId === currentUser.id && !isActive) {
    throw new Error('不能禁用自己的账户')
  }

  await db
    .update(users)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}
