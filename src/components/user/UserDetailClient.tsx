'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc/client'
import {
  ADMIN_LEVEL_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from '../../constants/user'
import { UserActions } from './UserActions'

interface UserDetailClientProps {
  userId: string
}

export function UserDetailClient({ userId }: UserDetailClientProps) {
  const {
    data: user,
    isLoading,
    error,
  } = trpc.users.getUserById.useQuery(
    { id: userId },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes cache
      gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    }
  )

  if (isLoading) {
    return <UserDetailSkeleton />
  }

  if (error || !user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">
            {error
              ? 'Failed to load user information'
              : 'User does not exist or has been deleted'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const initials =
    user.fullName
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    'U'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Details</CardTitle>
            <UserActions user={user} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={user.avatarUrl || undefined}
                alt={user.fullName || user.email}
              />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">
                {user.fullName || 'No name set'}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>

              <div className="flex items-center space-x-2">
                <Badge
                  className={
                    user.isActive
                      ? STATUS_COLORS.active
                      : STATUS_COLORS.inactive
                  }
                >
                  {STATUS_LABELS[user.isActive ? 'active' : 'inactive']}
                </Badge>

                {user.isAdmin && (
                  <Badge variant="secondary">
                    {ADMIN_LEVEL_LABELS[
                      user.adminLevel as keyof typeof ADMIN_LEVEL_LABELS
                    ] || ADMIN_LEVEL_LABELS[0]}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">User ID</p>
              <p className="text-sm text-muted-foreground font-mono">
                {user.id}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Registration Time</p>
              <p className="text-sm text-muted-foreground">
                {user.createdAt?.toLocaleDateString('en-US')}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Last Login</p>
              <p className="text-sm text-muted-foreground">
                {user.lastLoginAt?.toLocaleDateString('en-US') ||
                  'Never logged in'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Use Cases</p>
              <p className="text-sm text-muted-foreground">
                {user.totalUseCases || 0}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Tutorials</p>
              <p className="text-sm text-muted-foreground">
                {user.totalTutorials || 0}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Blogs</p>
              <p className="text-sm text-muted-foreground">
                {user.totalBlogs || 0}
              </p>
            </div>
          </div>

          {user.preferences && (
            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-3">User Preferences</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    {user.preferences.theme === 'dark' ? 'Dark' : 'Light'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Language</p>
                  <p className="text-sm text-muted-foreground">
                    {user.preferences.language === 'de' ? 'Deutsch' : 'English'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Currency</p>
                  <p className="text-sm text-muted-foreground">
                    {user.preferences.currency}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Timezone</p>
                  <p className="text-sm text-muted-foreground">
                    {user.preferences.timezone || 'UTC'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function UserDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-8 w-8" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <Skeleton className="h-6 w-24 mb-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-12 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
