import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '认证 - AI SaaS 模板',
  description: '登录或注册AI SaaS 模板账户',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
