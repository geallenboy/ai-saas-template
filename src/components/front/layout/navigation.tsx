'use client'

import {
  Laptop,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { SignInButton } from '@/components/auth/SignInButton'
import { Logo } from '@/components/common/logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/auth'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'

export default function Navigation() {
  const { isAuthenticated, isLoading, user, signOut } = useAuth()

  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      logger.info('User signed out successfully', {
        category: 'auth',
        userId: user?.id,
        action: 'sign_out',
      })
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      logger.error('Sign out failed', errorObj, {
        category: 'auth',
        userId: user?.id,
        action: 'sign_out',
      })
      router.push('/')
    }
  }

  const getUserInitials = (user: any) => {
    if (user?.fullName) {
      const names = user.fullName.split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return user.fullName[0].toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  const getUserDisplayName = (user: any) => {
    return user?.fullName || user?.email || 'User'
  }

  interface NavItem {
    href: string
    label: string
    active: boolean
    icon?: React.ReactNode
    premium?: boolean
  }

  const navItems: NavItem[] = [
    {
      href: '/',
      label: '首页',
      active: pathname === '/',
    },
    {
      href: '/contact',
      label: '联系我们',
      active: pathname.startsWith('/contact'),
    },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 transition-colors duration-300">
      <div className="relative z-10 max-w-none mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center group">
              <Logo />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 group transform hover:scale-105 flex items-center gap-2',
                  item.active
                    ? 'text-blue-600 dark:text-white bg-gradient-to-r from-blue-500/30 to-purple-500/30 dark:from-blue-500/20 dark:to-purple-500/20 backdrop-blur-sm border border-blue-400/50 dark:border-blue-400/30 shadow-[0_0_20px_rgba(59,130,246,0.4)] dark:shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                    : item.premium
                      ? 'text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-500 hover:to-purple-500 hover:bg-gray-100/80 dark:hover:bg-white/10 hover:backdrop-blur-sm hover:border hover:border-gradient-to-r hover:from-blue-400/50 hover:to-purple-400/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/10 hover:backdrop-blur-sm hover:border hover:border-gray-300/50 dark:hover:border-white/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                )}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                {item.icon && (
                  <span className="relative z-10">{item.icon}</span>
                )}
                <span className="relative z-10">{item.label}</span>
                {item.premium && !item.active && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                )}
                {item.active && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                )}
                <div
                  className={cn(
                    'absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10',
                    item.premium
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
                      : 'bg-gradient-to-r from-blue-500/5 to-purple-500/5'
                  )}
                />
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden md:block">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                suppressHydrationWarning
              >
                {isMounted ? (
                  theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {!isMounted || isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
              </div>
            ) : user ? (
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full p-0 transform transition-all duration-300 hover:scale-110 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]"
                    >
                      <div className="relative">
                        <Avatar className="h-9 w-9 border-2 border-gradient-to-r from-blue-400 to-purple-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                          <AvatarImage
                            src={user?.image || ''}
                            alt={getUserDisplayName(user)}
                          />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-sm animate-pulse" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>仪表板</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>设置</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>退出登录</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <SignInButton />
              </div>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden relative">
          <div className="relative z-10 px-4 py-6 space-y-4">
            <div className="space-y-2">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all duration-300 transform hover:scale-105 hover:translate-x-2',
                    item.active
                      ? 'text-blue-600 dark:text-white bg-gradient-to-r from-blue-500/40 to-purple-500/40 dark:from-blue-500/30 dark:to-purple-500/30 backdrop-blur-sm border border-blue-400/60 dark:border-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.5)] dark:shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                      : item.premium
                        ? 'text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:bg-gray-100/80 dark:hover:bg-white/10 hover:backdrop-blur-sm hover:border hover:border-gradient-to-r hover:from-blue-400/50 hover:to-purple-400/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/10 hover:backdrop-blur-sm hover:border hover:border-gray-300/50 dark:hover:border-white/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  )}
                  style={{ transformStyle: 'preserve-3d' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon && (
                    <span className="relative z-10">{item.icon}</span>
                  )}
                  <span className="relative z-10 flex-1">{item.label}</span>
                  {item.premium && !item.active && (
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                  )}
                  {item.active && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  )}
                  <div
                    className={cn(
                      'absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-all duration-300 -z-10 transform hover:scale-105',
                      item.premium
                        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
                        : 'bg-gradient-to-r from-blue-500/5 to-purple-500/5'
                    )}
                  />
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  主题
                </span>
                <div className="flex space-x-2" suppressHydrationWarning>
                  <Button
                    variant={
                      isMounted && theme === 'light' ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setTheme('light')}
                    className="transition-all duration-200"
                  >
                    <Sun className="h-4 w-4 mr-1" />
                    <span className="text-xs">浅色</span>
                  </Button>
                  <Button
                    variant={
                      isMounted && theme === 'dark' ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setTheme('dark')}
                    className="transition-all duration-200"
                  >
                    <Moon className="h-4 w-4 mr-1" />
                    <span className="text-xs">深色</span>
                  </Button>
                  <Button
                    variant={
                      isMounted && theme === 'system' ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setTheme('system')}
                    className="transition-all duration-200"
                  >
                    <Laptop className="h-4 w-4 mr-1" />
                    <span className="text-xs">系统</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
