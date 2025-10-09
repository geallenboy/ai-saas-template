'use client'

import { Bell, CreditCard, Key, Settings, Shield, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const settingsNavigation = [
  {
    name: '个人资料',
    href: '/settings/profile',
    icon: User,
    description: '管理您的个人信息',
  },
  {
    name: '安全设置',
    href: '/settings/security',
    icon: Shield,
    description: '密码和会话管理',
  },
  {
    name: '通知设置',
    href: '/settings/notifications',
    icon: Bell,
    description: '邮件和推送通知',
  },
  {
    name: '订阅管理',
    href: '/settings/billing',
    icon: CreditCard,
    description: '账单和订阅信息',
  },
  {
    name: 'API 密钥',
    href: '/settings/api-keys',
    icon: Key,
    description: '管理API访问密钥',
  },
  {
    name: '高级设置',
    href: '/settings/advanced',
    icon: Settings,
    description: '其他高级选项',
  },
]

export function SettingsNavigation() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {settingsNavigation.map(item => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
            }`}
          >
            <Icon className="flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
            <div className="flex-1">
              <div>{item.name}</div>
              <div
                className={`text-xs ${
                  isActive
                    ? 'text-primary-foreground/80'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {item.description}
              </div>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
