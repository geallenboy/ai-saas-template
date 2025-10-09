'use client'

import {
  ChevronRight,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { logger } from '../../lib/logger'

interface NavItem {
  title: string
  href: string
  icon: any
  badge?: string | null
  children?: {
    title: string
    href: string
    icon: any
  }[]
}

const adminNavItems: NavItem[] = [
  {
    title: '仪表板',
    href: '/admin',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: '用户管理',
    href: '/admin/users',
    icon: Users,
    badge: null,
  },
  {
    title: '系统设置',
    href: '/admin/system',
    icon: Settings,
    badge: null,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  // const { signOut } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    // 自动展开包含当前路径的菜单项
    const expandedItem = adminNavItems.find(item =>
      item.children?.some(child => pathname.startsWith(child.href))
    )
    if (expandedItem) {
      setExpandedItems([expandedItem.href])
    }
  }, [pathname])

  const handleSignOut = async () => {
    if (isSigningOut) return // 防止重复点击

    setIsSigningOut(true)
    try {
      logger.info('Admin sign out triggered')
    } catch (error) {
      logger.error('Admin sign out failed', error as Error, {
        category: 'auth',
        component: 'AdminSidebar',
        action: 'admin_sign_out',
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href) ? prev.filter(item => item !== href) : [...prev, href]
    )
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border shadow-lg flex flex-col">
      {/* 头部 */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center mb-2">
          <div className="relative">
            <span className="text-xl font-bold gradient-text">AI</span>
            <span className="text-xl font-bold text-sidebar-foreground ml-1">
              SaaS
            </span>
            <Sparkles className="absolute -top-1 -right-4 h-4 w-4 text-yellow-500 animate-pulse" />
          </div>
        </div>
        <p className="text-sm text-sidebar-foreground/70">管理后台</p>
        <Badge variant="secondary" className="mt-2 text-xs">
          v2.0.0
        </Badge>
      </div>

      {/* 导航菜单 */}
      <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
        {adminNavItems.map(item => {
          const Icon = item.icon
          const isExpanded = expandedItems.includes(item.href)
          const hasChildren = item.children && item.children.length > 0
          const isActive =
            mounted &&
            !hasChildren &&
            (pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href)))
          const hasActiveChild =
            mounted &&
            hasChildren &&
            item.children?.some(child => pathname.startsWith(child.href))

          return (
            <div key={item.href}>
              {/* 主菜单项 */}
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpanded(item.href)}
                  className={cn(
                    'group flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    hasActiveChild
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <div className="flex items-center">
                    <Icon
                      className={cn(
                        'h-4 w-4 mr-3 transition-colors',
                        hasActiveChild
                          ? 'text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70'
                      )}
                    />
                    <span>{item.title}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {item.badge && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0.5 h-5"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight
                      className={cn(
                        'h-3 w-3 transition-transform duration-200',
                        isExpanded ? 'transform rotate-90' : '',
                        hasActiveChild
                          ? 'text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70'
                      )}
                    />
                  </div>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <div className="flex items-center">
                    <Icon
                      className={cn(
                        'h-4 w-4 mr-3 transition-colors',
                        isActive
                          ? 'text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70'
                      )}
                    />
                    <span>{item.title}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {item.badge && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0.5 h-5"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              )}

              {/* 子菜单 */}
              {hasChildren && isExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children?.map(child => {
                    const ChildIcon = child.icon
                    const isChildActive =
                      mounted && pathname.startsWith(child.href)

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'group flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200',
                          isChildActive
                            ? 'bg-sidebar-accent/70 text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/30 hover:text-sidebar-accent-foreground'
                        )}
                      >
                        <ChildIcon
                          className={cn(
                            'h-3.5 w-3.5 mr-3 transition-colors',
                            isChildActive
                              ? 'text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground/60'
                          )}
                        />
                        <span>{child.title}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* 底部操作区 */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {/* 返回首页 */}
        <Link
          href="/"
          className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-sidebar-foreground rounded-lg hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all duration-200 group"
        >
          <Home className="h-4 w-4 mr-3 text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground transition-colors" />
          返回首页
        </Link>

        {/* 退出登录 */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut
            className={cn('h-4 w-4 mr-3', isSigningOut && 'animate-spin')}
          />
          {isSigningOut ? '退出中...' : '退出登录'}
        </Button>
      </div>
    </div>
  )
}
