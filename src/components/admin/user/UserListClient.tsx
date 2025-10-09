'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/server/client'
import type { UserQueryParams } from '@/types/user'
import { UserListHeader } from './UserListHeader'
import { UserTable } from './UserTable'

export function UserListClient() {
  const searchParams = useSearchParams()

  // 构建查询参数
  const params: UserQueryParams = {
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 20,
    search: searchParams.get('search') || undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    isActive: searchParams.get('isActive')
      ? searchParams.get('isActive') === 'true'
      : undefined,
    isAdmin: searchParams.get('isAdmin')
      ? searchParams.get('isAdmin') === 'true'
      : undefined,
  }

  const {
    data: result,
    isLoading,
    error,
  } = trpc.users.getUsers.useQuery(params, {
    staleTime: 2 * 60 * 1000, // 2分钟缓存
    gcTime: 5 * 60 * 1000, // 5分钟垃圾回收
  })

  if (isLoading) {
    return <UserListSkeleton />
  }

  if (error || !result) {
    return (
      <div className="space-y-4">
        <UserListHeader />
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-destructive">加载用户列表失败</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <UserListHeader />

      <Card>
        <CardContent className="p-0">
          <UserTable
            users={result.users}
            total={result.total}
            page={result.page}
            limit={result.limit}
            totalPages={result.totalPages}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function UserListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Table skeleton */}
      <Card>
        <CardContent className="p-0">
          <div className="p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 py-3 border-b last:border-b-0"
              >
                <Skeleton className="h-4 w-4" />
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <div className="flex items-center space-x-2 ml-auto">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
