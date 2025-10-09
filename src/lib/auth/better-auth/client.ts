'use client'

import { adminClient, usernameClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  plugins: [usernameClient(), adminClient()],
})

// 导出常用方法
export const { signIn, signUp, signOut, useSession, getSession } = authClient

// 扩展用户类型定义
export interface ExtendedUser {
  id: string
  email: string
  emailVerified: boolean
  name: string
  image?: string | null
  createdAt: Date
  updatedAt: Date
  username?: string | null
  displayUsername?: string | null
  role?: string | null

  // 扩展字段
  fullName?: string | null
  isAdmin: boolean
  adminLevel: number
  isActive: boolean
  banned: boolean
  banReason?: string | null
  banExpires?: Date | null
  locale: string
  preferences: any
}

// 自定义Hook
export function useBetterAuth() {
  const { data: session, isPending, error } = useSession()

  return {
    user: session?.user as ExtendedUser | null,
    session: session?.session,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    isAdmin: (session?.user as any)?.isAdmin ?? false,
    error,

    // 便捷方法
    login: signIn,
    logout: signOut,
    register: signUp,
  }
}

// 类型导出
export type BetterAuthSession = ReturnType<typeof useSession>['data']
