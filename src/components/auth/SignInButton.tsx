'use client'

import { LogIn, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/auth'

export function SignInButton() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/auth/login">
          <LogIn className="h-4 w-4 mr-2" />
          登录
        </Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/auth/register">
          <UserPlus className="h-4 w-4 mr-2" />
          注册
        </Link>
      </Button>
    </div>
  )
}
