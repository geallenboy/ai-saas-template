'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ADMIN_LEVEL_NAMES } from '@/constants/auth'
import { useAuth } from '@/hooks/auth'

interface UserProfileClientProps {
  showAdminBadge?: boolean
}

export function UserProfileClient({
  showAdminBadge = true,
}: UserProfileClientProps) {
  const { user, isLoading, isAuthenticated } = useAuth()

  // 在开发环境下调试输出
  if (process.env.NODE_ENV === 'development') {
    console.log('UserProfileClient - auth user:', user)
    console.log('UserProfileClient - isLoading:', isLoading)
    console.log('UserProfileClient - isAuthenticated:', isAuthenticated)
  }

  if (isLoading) {
    return <UserProfileSkeleton />
  }

  if (!(isAuthenticated && user)) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            {!isAuthenticated ? '请先登录查看用户信息' : '用户信息不存在'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const displayName = user.fullName || user.name || user.email
  const initials =
    displayName
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    'U'

  return (
    <Card>
      <CardHeader>
        <CardTitle>用户资料</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image || undefined} alt={displayName} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              {user.fullName ||
                user.name ||
                user.email?.split('@')[0] ||
                '用户'}
            </h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>

            <div className="flex flex-wrap gap-2 mt-2">
              {user.emailVerified && (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  邮箱已验证
                </Badge>
              )}

              {showAdminBadge && user.isAdmin && (
                <Badge variant="secondary">
                  {ADMIN_LEVEL_NAMES[
                    user.adminLevel as keyof typeof ADMIN_LEVEL_NAMES
                  ] || ADMIN_LEVEL_NAMES[0]}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div>
            <p className="text-sm font-medium">注册时间</p>
            <p className="text-sm text-muted-foreground">
              {user.createdAt
                ? typeof user.createdAt === 'string'
                  ? new Date(user.createdAt).toLocaleDateString('zh-CN')
                  : user.createdAt.toLocaleDateString('zh-CN')
                : '未知'}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium">更新时间</p>
            <p className="text-sm text-muted-foreground">
              {user.updatedAt
                ? typeof user.updatedAt === 'string'
                  ? new Date(user.updatedAt).toLocaleDateString('zh-CN')
                  : user.updatedAt.toLocaleDateString('zh-CN')
                : '未知'}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium">账户状态</p>
            <Badge variant={user.isActive ? 'default' : 'destructive'}>
              {user.isActive ? '活跃' : '已禁用'}
            </Badge>
          </div>

          <div>
            <p className="text-sm font-medium">语言偏好</p>
            <p className="text-sm text-muted-foreground">
              {(user.preferences as any)?.language === 'zh'
                ? '中文'
                : 'English'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function UserProfileSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-24" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <Skeleton className="h-4 w-16 mb-2" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
