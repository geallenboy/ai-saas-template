'use client'

import {
  AlertCircle,
  Crown,
  RefreshCw,
  Search,
  Shield,
  User,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/auth'
import { trpc } from '@/server/client'

interface PermissionManagementProps {
  className?: string
}

export function PermissionManagement({ className }: PermissionManagementProps) {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('users')

  if (!(isAuthenticated && user)) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">请先登录以访问权限管理。</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 检查是否是超级管理员
  if (!user.isAdmin || (user.adminLevel ?? 0) < 2) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">权限不足</h3>
            <p className="text-muted-foreground">
              只有超级管理员才能访问权限管理功能。
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">权限管理</h1>
          <p className="text-muted-foreground">管理用户权限和管理员级别</p>
        </div>
        <div className="text-sm text-muted-foreground">
          当前用户: {user.email} (管理员级别: {user.adminLevel})
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            用户管理
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            角色说明
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="roles">
          <RoleDescriptionTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 用户管理标签页
function UserManagementTab() {
  const [searchEmail, setSearchEmail] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const {
    data: usersData,
    isLoading,
    refetch,
  } = trpc.users.getUsers.useQuery({
    search: searchEmail || undefined,
    isAdmin:
      roleFilter === 'admin' ? true : roleFilter === 'user' ? false : undefined,
    limit: 50,
  })

  const updateUserRole = trpc.users.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success('用户权限更新成功')
      refetch()
    },
    onError: error => {
      toast.error(error.message || '更新用户权限失败')
    },
  })

  const toggleUserStatus = trpc.users.toggleUserStatus.useMutation({
    onSuccess: () => {
      toast.success('用户状态更新成功')
      refetch()
    },
    onError: error => {
      toast.error(error.message || '更新用户状态失败')
    },
  })

  const handleRoleChange = (userId: string, newLevel: number) => {
    updateUserRole.mutate({
      userId,
      adminLevel: newLevel,
      isAdmin: newLevel > 0,
    })
  }

  const handleToggleStatus = (userId: string, isActive: boolean) => {
    toggleUserStatus.mutate({
      userId,
      isActive: !isActive,
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>加载用户数据中...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>用户列表</span>
          <div className="text-sm text-muted-foreground">
            共 {usersData?.users.length || 0} 个用户
          </div>
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户邮箱..."
              value={searchEmail}
              onChange={e => setSearchEmail(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="筛选角色" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有用户</SelectItem>
              <SelectItem value="user">普通用户</SelectItem>
              <SelectItem value="admin">管理员</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户信息</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersData?.users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchEmail || roleFilter !== 'all'
                    ? '没有找到匹配的用户'
                    : '暂无用户数据'}
                </TableCell>
              </TableRow>
            ) : (
              usersData?.users.map((user: any) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.fullName || user.name || '未设置姓名'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <AdminLevelBadge
                        level={user.adminLevel || 0}
                        isAdmin={user.isAdmin}
                      />
                      <Select
                        value={(user.adminLevel || 0).toString()}
                        onValueChange={value =>
                          handleRoleChange(user.id, Number.parseInt(value, 10))
                        }
                        disabled={updateUserRole.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">普通用户</SelectItem>
                          <SelectItem value="1">管理员</SelectItem>
                          <SelectItem value="2">超级管理员</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Badge
                        variant={user.isActive ? 'default' : 'destructive'}
                      >
                        {user.isActive ? '正常' : '禁用'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleToggleStatus(user.id, user.isActive)
                        }
                        disabled={toggleUserStatus.isPending}
                      >
                        {user.isActive ? '禁用' : '启用'}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('zh-CN')
                        : '未知'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // 可以在这里添加更多操作，如查看详情等
                          toast.info(`用户ID: ${user.id}`)
                        }}
                      >
                        详情
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// 角色说明标签页
function RoleDescriptionTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>权限级别说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-5 w-5" />
                    普通用户
                    <Badge variant="secondary">Level 0</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li>• 基本功能使用权限</li>
                    <li>• 查看个人信息</li>
                    <li>• 使用会员功能</li>
                    <li>• 查看支付历史</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-5 w-5" />
                    管理员
                    <Badge variant="default">Level 1</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li>• 继承普通用户所有权限</li>
                    <li>• 查看用户列表</li>
                    <li>• 管理用户状态</li>
                    <li>• 查看系统统计</li>
                    <li>• 处理用户问题</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Crown className="h-5 w-5" />
                    超级管理员
                    <Badge variant="destructive">Level 2</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li>• 继承管理员所有权限</li>
                    <li>• 管理其他管理员权限</li>
                    <li>• 系统配置管理</li>
                    <li>• 权限系统管理</li>
                    <li>• 危险操作权限</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">权限管理规则</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">提升权限规则</h4>
                    <ul className="text-sm space-y-1 pl-4">
                      <li>• 只有超级管理员可以提升其他用户为管理员</li>
                      <li>• 只有超级管理员可以指定其他超级管理员</li>
                      <li>• 用户不能修改自己的权限级别</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">安全限制</h4>
                    <ul className="text-sm space-y-1 pl-4">
                      <li>• 管理员不能禁用超级管理员</li>
                      <li>• 用户不能禁用自己的账户</li>
                      <li>• 所有权限变更都有操作日志记录</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">权限验证</h4>
                    <ul className="text-sm space-y-1 pl-4">
                      <li>• 基于Better Auth会话验证</li>
                      <li>• 中间件层面进行权限检查</li>
                      <li>• API路由保护</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 管理员级别徽章组件
function AdminLevelBadge({
  level,
  isAdmin,
}: {
  level: number
  isAdmin: boolean
}) {
  if (!isAdmin || level === 0) {
    return (
      <Badge variant="secondary" className="text-xs">
        <User className="h-3 w-3 mr-1" />
        普通用户
      </Badge>
    )
  }

  if (level === 1) {
    return (
      <Badge variant="default" className="text-xs">
        <Shield className="h-3 w-3 mr-1" />
        管理员
      </Badge>
    )
  }

  if (level >= 2) {
    return (
      <Badge variant="destructive" className="text-xs">
        <Crown className="h-3 w-3 mr-1" />
        超级管理员
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="text-xs">
      未知级别 ({level})
    </Badge>
  )
}
