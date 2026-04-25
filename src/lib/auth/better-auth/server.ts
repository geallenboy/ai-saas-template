import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, username } from 'better-auth/plugins'
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from '@/drizzle/schemas'
import { env } from '@/env'
import { sendVerificationEmail as sendVerificationEmailFn } from '@/lib/auth/email-verification'
import {
  recordLoginAttempt,
} from '@/lib/auth/login-security'
import { sendResetEmail as sendResetEmailFn } from '@/lib/auth/password-reset'
import { db } from '../../db'

export const auth = betterAuth({
  // 数据库适配器 - 明确指定schema映射
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verificationTokens,
    },
    // 添加自定义字段映射，确保兼容性
    usePlural: false,
  }),

  // 基础配置
  secret: env.BETTER_AUTH_SECRET || 'your-secret-key-change-in-production',
  baseURL: env.BETTER_AUTH_URL || env.NEXT_PUBLIC_SITE_URL,

  // 邮箱密码认证
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendVerificationEmail: async ({
      user,
      url,
    }: { user: { email: string; name: string }; url: string }) => {
      try {
        await sendVerificationEmailFn(
          { email: user.email, name: user.name },
          url
        )
      } catch (error) {
        console.error('📧 邮箱验证邮件发送失败:', error)
        // 不抛出错误，避免阻塞注册流程（用户可以稍后重新发送）
      }
    },
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendResetEmailFn(
          { email: user.email, name: user.name },
          url
        )
      } catch (error) {
        console.error('📧 密码重置邮件发送失败:', error)
        throw error
      }
    },
  },

  // 社交登录提供商
  socialProviders: {
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          // 设置正确的重定向URI
          redirectURI: `${env.BETTER_AUTH_URL || env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/google`,
        },
      }
      : {}),
    ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
      ? {
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          redirectURI: `${env.BETTER_AUTH_URL || env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/github`,
        },
      }
      : {}),
  },

  // 插件
  plugins: [username(), admin()],

  // 用户字段扩展
  user: {
    additionalFields: {
      fullName: {
        type: 'string',
        required: false,
      },
      isAdmin: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
      adminLevel: {
        type: 'number',
        required: false,
        defaultValue: 0,
      },
      isActive: {
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
      locale: {
        type: 'string',
        required: false,
        defaultValue: 'zh',
      },
      preferences: {
        type: 'string', // Better-Auth 不直接支持 object，使用 JSON 字符串
        required: false,
        defaultValue: JSON.stringify({
          theme: 'light',
          language: 'zh',
          currency: 'CNY',
          timezone: 'Asia/Shanghai',
        }),
      },
    },
  },

  // 会话配置（优化状态同步）
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7天
    updateAge: 60 * 60 * 2, // 2小时更新一次（提高同步频率）
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 2, // 2小时缓存（缩短缓存时间以提高状态同步）
    },
  },

  // 高级配置
  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === 'production',
      domain:
        process.env.NODE_ENV === 'production' ? env.COOKIE_DOMAIN : undefined,
    },
    cookiePrefix: 'better-auth',
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    },
  },

  // OAuth 配置 - 关键修复
  trustedOrigins: [
    env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    env.BETTER_AUTH_URL || env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'http://localhost:3001', // 开发环境备用端口
  ],

  // 回调处理
  callbacks: {
    async signUp({ user, account }: { user: any; account?: any }) {
      console.log('📝 Better Auth - 用户注册回调:', {
        user: user.email,
        account: account?.providerId,
      })

      // 如果是OAuth登录，确保用户信息完整
      if (account?.providerId === 'google') {
        const updates: any = {}

        // 如果缺少姓名，从邮箱生成
        if (!user.name && user.email) {
          updates.name = user.email.split('@')[0]
        }

        // 如果缺少fullName，设置为name
        if (!user.fullName && user.name) {
          updates.fullName = user.name
        }

        if (Object.keys(updates).length > 0) {
          console.log('🔧 补全用户信息:', updates)
          // 这里可以调用数据库更新，但Better Auth会自动处理基本字段
        }
      }

      return user
    },

    async signIn({ user, account }: { user: any; account?: any }) {
      console.log('🔑 Better Auth - 用户登录回调:', {
        user: user.email,
        account: account?.providerId,
      })

      // 对邮箱密码登录进行安全检查
      if (!account?.providerId || account.providerId === 'credential') {
        try {
          // 记录成功的登录尝试（清除失败计数）
          await recordLoginAttempt(user.email, 'unknown', true)
        } catch (error) {
          console.error('记录登录尝试失败:', error)
        }
      }

      return user
    },
  },
})

// 导出类型
export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user

// 辅助函数
export const getServerSession = () =>
  auth.api.getSession({
    headers: new Headers(),
  })

export const getServerCurrentUser = async () => {
  const session = await getServerSession()
  return session?.user || null
}
