'use client'

import { Shield, TrendingUp, UserCheck, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/server/client'

export function UserStatsClient() {
  const {
    data: stats,
    isLoading,
    error,
  } = trpc.users.getUserStats.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 10 * 60 * 1000, // 10分钟垃圾回收
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
      title: '总用户数',
      value: stats.total || 0,
      icon: Users,
      description: '平台注册用户总数',
      color: 'text-blue-600',
    },
    {
      title: '活跃用户',
      value: stats.active || 0,
      icon: UserCheck,
      description: '当前活跃用户数',
      color: 'text-green-600',
    },
    {
      title: '管理员',
      value: stats.admins || 0,
      icon: Shield,
      description: '管理员账户数量',
      color: 'text-purple-600',
    },
    {
      title: '非活跃用户',
      value: stats.inactive || 0,
      icon: TrendingUp,
      description: '非活跃用户数量',
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
