'use client'

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
import { useUserMembership } from '@/hooks/use-membership'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import { useClerk, useUser } from '@clerk/nextjs'
import {
  Crown,
  Laptop,
  LogOut,
  Menu,
  Moon,
  Settings,
  Shield,
  Star,
  Sun,
  User,
  X,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navigation() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()

  // Use tRPC to query member status with performance optimization
  const { hasActiveMembership, currentPlan } = useUserMembership(user?.id)

  const loading = !isLoaded
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('navigation')
  const localeT = useTranslations('locale')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure that the component displays user-related content only after it is mounted on the client
  useEffect(() => {
    setIsMounted(true)
    const timer = setTimeout(() => {
      // Delay setting the initial state to ensure Clerk is fully loaded
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Check if the user is an admin
  const isUserAdmin =
    user?.publicMetadata?.isAdmin === true ||
    (typeof user?.publicMetadata?.adminLevel === 'number' &&
      user.publicMetadata.adminLevel > 0)

  const handleSignOut = async () => {
    try {
      // Use Clerk's sign out functionality
      await signOut({ redirectUrl: `/${locale}` })
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
    }
  }

  // Update language switch logic to use route navigation
  const handleLanguageChange = (newLocale: 'de' | 'en') => {
    const currentPath = pathname
    // Remove current language prefix
    const pathWithoutLocale = currentPath.replace(`/${locale}`, '') || '/'
    // Redirect to the new language path
    router.push(`/${newLocale}${pathWithoutLocale}`)
  }

  // Build path with locale prefix
  const localePath = (path: string) => `/${locale}${path}`

  const getUserInitials = (user: any) => {
    if (user?.fullName) {
      const names = user.fullName.split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return user.fullName[0].toUpperCase()
    }
    if (user?.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress[0].toUpperCase()
    }
    return 'U'
  }

  const getUserDisplayName = (user: any) => {
    return user?.fullName || user?.primaryEmailAddress?.emailAddress || 'User'
  }

  // Update navigation items to use locale routing
  const navItems = [
    {
      href: localePath('/'),
      label: t('home'),
      active: pathname === localePath('/') || pathname === `/${locale}`,
    },
    {
      href: localePath('/blog'),
      label: t('blogs'),
      active: pathname.startsWith(localePath('/blog')),
    },
    {
      href: localePath('/docs'),
      label: t('docs'),
      active: pathname.startsWith(localePath('/docs')),
    },
    {
      href: localePath('/blocks'),
      label: t('blocks'),
      active: pathname.startsWith(localePath('/blocks')),
    },
    {
      href: localePath('/pricing'),
      label: t('pricing'),
      active: pathname.startsWith(localePath('/pricing')),
    },
    {
      href: localePath('/contact'),
      label: t('contact'),
      active: pathname.startsWith(localePath('/contact')),
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

          {/* Desktop navigation menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 group transform hover:scale-105',
                  item.active
                    ? 'text-blue-600 dark:text-white bg-gradient-to-r from-blue-500/30 to-purple-500/30 dark:from-blue-500/20 dark:to-purple-500/20 backdrop-blur-sm border border-blue-400/50 dark:border-blue-400/30 shadow-[0_0_20px_rgba(59,130,246,0.4)] dark:shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/10 hover:backdrop-blur-sm hover:border hover:border-gray-300/50 dark:hover:border-white/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                )}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                <span className="relative z-10">{item.label}</span>
                {item.active && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                )}
                {/* 3D floating effect background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </Link>
            ))}
          </div>

          {/* Right action area */}
          <div className="flex items-center space-x-2">
            {/* Desktop language switcher */}
            <div className="hidden md:block">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleLanguageChange(locale === 'de' ? 'en' : 'de')
                }
              >
                {locale === 'de' ? 'EN' : 'Deutsch'}
              </Button>
            </div>

            {/* Desktop theme switcher */}
            <div className="hidden md:block">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Mobile menu button */}
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

            {/* User menu area - Optimize rendering */}
            {!isMounted ? (
              // Server-side and initial client rendering shows a simple placeholder
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted/30 rounded-full" />
              </div>
            ) : loading ? (
              // Loading state
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
              </div>
            ) : user ? (
              // Logged-in user menu
              <div className="flex items-center space-x-2">
                {/* Member ID */}
                {hasActiveMembership && currentPlan && (
                  <div className="hidden md:flex items-center">
                    {currentPlan.name === 'Professional' && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full">
                        <Star className="h-3 w-3" />
                        <span>{localeT('professional')}</span>
                      </div>
                    )}
                    {currentPlan.name === 'Enterprise' && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium rounded-full">
                        <Crown className="h-3 w-3" />
                        <span>{localeT('enterprise')}</span>
                      </div>
                    )}
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full p-0 transform transition-all duration-300 hover:scale-110 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]"
                    >
                      <div className="relative">
                        <Avatar className="h-9 w-9 border-2 border-gradient-to-r from-blue-400 to-purple-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                          <AvatarImage
                            src={user?.imageUrl || ''}
                            alt={getUserDisplayName(user)}
                          />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        {/* Glowing ring effect */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-sm animate-pulse" />
                      </div>
                      {/* Membership status indicator - Enhanced version */}
                      {hasActiveMembership && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse">
                          <Crown className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium leading-none">
                            {getUserDisplayName(user)}
                          </p>
                          {/* Menu membership indicator */}
                          {hasActiveMembership && currentPlan && (
                            <div className="flex items-center gap-1">
                              {currentPlan.name === 'Professional' && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                  <Star className="h-2.5 w-2.5" />
                                  <span>{localeT('pro')}</span>
                                </div>
                              )}
                              {currentPlan.name === 'Enterprise' && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                                  <Crown className="h-2.5 w-2.5" />
                                  <span>{localeT('enterprise')}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link
                        href={localePath('/dashboard')}
                        className="flex items-center"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>{t('dashboard')}</span>
                      </Link>
                    </DropdownMenuItem>

                    {/* Membership center entry for members */}
                    {hasActiveMembership && (
                      <DropdownMenuItem asChild>
                        <Link
                          href={localePath('/membership')}
                          className="flex items-center text-blue-600 dark:text-blue-400"
                        >
                          <Crown className="mr-2 h-4 w-4" />
                          <span>
                            {locale === 'de'
                              ? 'Mitgliederbereich'
                              : 'Membership Center'}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                      <Link
                        href={localePath('/settings')}
                        className="flex items-center"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t('settings')}</span>
                      </Link>
                    </DropdownMenuItem>

                    {/* Administrator entrance */}
                    {isUserAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href={localePath('/admin')}
                            className="text-amber-600 dark:text-amber-400"
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            <span>{t('adminPanel')}</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('signOut')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              // Not logged in
              <div className="flex items-center space-x-2">
                <SignInButton />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu - 3D technology style */}
      {isMenuOpen && (
        <div className="md:hidden relative">
          <div className="relative z-10 px-4 py-6 space-y-4">
            {/* Navigation links */}
            <div className="space-y-2">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative block px-4 py-3 text-base font-medium rounded-lg transition-all duration-300 transform hover:scale-105 hover:translate-x-2',
                    item.active
                      ? 'text-blue-600 dark:text-white bg-gradient-to-r from-blue-500/40 to-purple-500/40 dark:from-blue-500/30 dark:to-purple-500/30 backdrop-blur-sm border border-blue-400/60 dark:border-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.5)] dark:shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/10 hover:backdrop-blur-sm hover:border hover:border-gray-300/50 dark:hover:border-white/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  )}
                  style={{ transformStyle: 'preserve-3d' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">{item.label}</span>
                  {item.active && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  )}
                  {/* 3D floating background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 hover:opacity-100 transition-all duration-300 -z-10 transform hover:scale-105" />
                </Link>
              ))}
            </div>

            {/* Mobile tools */}
            <div className="pt-4 border-t border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {localeT('label')}
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant={locale === 'de' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      handleLanguageChange('de')
                      setIsMenuOpen(false)
                    }}
                  >
                    中文
                  </Button>
                  <Button
                    variant={locale === 'en' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      handleLanguageChange('en')
                      setIsMenuOpen(false)
                    }}
                  >
                    EN
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-muted-foreground">
                  主题
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                    className="transition-all duration-200"
                  >
                    <Sun className="h-4 w-4 mr-1" />
                    <span className="text-xs">亮色</span>
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                    className="transition-all duration-200"
                  >
                    <Moon className="h-4 w-4 mr-1" />
                    <span className="text-xs">深色</span>
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
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
