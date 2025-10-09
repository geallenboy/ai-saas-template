'use client'

import { BarChart3, Home, Settings, Shield, Users } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { AdminGuardClient } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { localizePath } from '@/lib/utils'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = useLocale()
  return (
    <AdminGuardClient>
      <div className="flex h-screen bg-background">
        {/* 侧边栏 */}
        <aside className="w-64 bg-card border-r">
          <div className="p-6">
            <h2 className="text-xl font-semibold">管理后台</h2>
          </div>

          <nav className="px-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href={localizePath(locale, '/admin')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                仪表盘
              </Link>
            </Button>

            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href={localizePath(locale, '/admin/users')}>
                <Users className="mr-2 h-4 w-4" />
                用户管理
              </Link>
            </Button>

            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href={localizePath(locale, '/admin/permissions')}>
                <Shield className="mr-2 h-4 w-4" />
                权限管理
              </Link>
            </Button>

            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href={localizePath(locale, '/admin/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                系统设置
              </Link>
            </Button>

            <div className="pt-4 border-t">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href={localizePath(locale, '/')}>
                  <Home className="mr-2 h-4 w-4" />
                  返回首页
                </Link>
              </Button>
            </div>
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </AdminGuardClient>
  )
}
