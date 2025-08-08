'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc/client'
import { Shield, TrendingUp, UserCheck, Users } from 'lucide-react'

export function UserStatsClient() {
  const {
    data: stats,
    isLoading,
    error,
  } = trpc.users.getUserStats.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  })

  if (isLoading) {
    return <UserStatsSkeleton />
  }

  if (error || !stats) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">加载统计数据失败</p>
      </div>
    )
  }

  const statItems = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: Users,
      description: 'Total registered users',
      color: 'text-blue-600',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers || 0,
      icon: UserCheck,
      description: 'Current active users',
      color: 'text-green-600',
    },
    {
      title: 'Admin Users',
      value: stats.adminUsers || 0,
      icon: Shield,
      description: 'Number of admin accounts',
      color: 'text-purple-600',
    },
    {
      title: 'New This Month',
      value: stats.newUsersThisMonth || 0,
      icon: TrendingUp,
      description: 'Newly registered users this month',
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map(item => {
        const Icon = item.icon
        return (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function UserStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
