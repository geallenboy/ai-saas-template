'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Loader2, Shield } from 'lucide-react'
import type React from 'react'

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  loadingComponent?: React.ReactNode
}

export function AdminGuard({
  children,
  fallback,
  loadingComponent,
}: AdminGuardProps) {
  // const { isAdmin, isLoading } = useAdmin()

  // logger.debug('AdminGuard status check', {
  //   category: 'auth',
  //   component: 'AdminGuard',
  //   isLoading,
  //   isAdmin
  // })

  // // If you are an administrator, display the content immediately
  // if (isAdmin && !isLoading) {
  //   logger.debug('AdminGuard: Admin user authenticated, showing content', {
  //     category: 'auth',
  //     component: 'AdminGuard',
  //     action: 'allow_access'
  //   })
  //   return <>{children}</>
  // }

  // // If not an administrator and not loading, show access denied
  // if (!isAdmin && !isLoading) {
  //   logger.warn('AdminGuard: User lacks admin permissions, access denied', {
  //     category: 'auth',
  //     component: 'AdminGuard',
  //     action: 'deny_access',
  //     reason: 'insufficient_permissions'
  //   })
  //   return (
  //     fallback || (
  //       <div className="min-h-screen bg-background flex items-center justify-center">
  //         <Card className="w-full max-w-md">
  //           <CardHeader className="text-center">
  //             <CardTitle>访问被拒绝</CardTitle>
  //             <CardDescription>您没有管理员权限</CardDescription>
  //           </CardHeader>
  //         </Card>
  //       </div>
  //     )
  //   )
  // }

  // Show loading state
  return loadingComponent || <DefaultLoadingComponent />
}

function DefaultLoadingComponent() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>

          <CardTitle className="text-lg font-semibold">快速验证中</CardTitle>

          <CardDescription>正在验证管理员权限...</CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">验证中</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
