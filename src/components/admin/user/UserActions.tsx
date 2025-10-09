'use client'

import {
  Edit,
  MoreHorizontal,
  Shield,
  ShieldOff,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User } from '@/drizzle/schemas'
import { trpc } from '@/server/client'

interface UserActionsProps {
  user: User
}

export function UserActions({ user }: UserActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showToggleDialog, setShowToggleDialog] = useState(false)
  const [showPromoteDialog, setShowPromoteDialog] = useState(false)
  const router = useRouter()

  const utils = trpc.useUtils()

  const deleteUserMutation = trpc.users.deleteUser.useMutation({
    onSuccess: () => {
      // 刷新数据并返回列表页面
      utils.users.getUsers.invalidate()
      utils.users.getUserStats.invalidate()
      setShowDeleteDialog(false)
      router.push('/admin/users')
    },
    onError: (error: any) => {
      console.error('删除用户失败:', error)
    },
  })

  const toggleStatusMutation = trpc.users.toggleUserStatus.useMutation({
    onSuccess: () => {
      // 刷新用户详情和列表数据
      utils.users.getUserById.invalidate({ id: user.id })
      utils.users.getUsers.invalidate()
      utils.users.getUserStats.invalidate()
      setShowToggleDialog(false)
    },
    onError: (error: any) => {
      console.error('切换用户状态失败:', error)
    },
  })

  const updateUserMutation = trpc.users.updateUser.useMutation({
    onSuccess: () => {
      // 刷新用户详情和列表数据
      utils.users.getUserById.invalidate({ id: user.id })
      utils.users.getUsers.invalidate()
      utils.users.getUserStats.invalidate()
      setShowPromoteDialog(false)
    },
    onError: error => {
      console.error('更新用户失败:', error)
    },
  })

  const handleDelete = () => {
    deleteUserMutation.mutate({ id: user.id })
  }

  const handleToggleStatus = () => {
    toggleStatusMutation.mutate({ userId: user.id, isActive: !user.isActive })
  }

  const handleToggleAdmin = () => {
    updateUserMutation.mutate({
      id: user.id,
      fullName: user.fullName || '',
      isActive: user.isActive ?? true,
    })
  }

  const isPending =
    deleteUserMutation.isPending ||
    toggleStatusMutation.isPending ||
    updateUserMutation.isPending

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            编辑用户
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowToggleDialog(true)}>
            {user.isActive ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                禁用用户
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                激活用户
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowPromoteDialog(true)}>
            {user.isAdmin ? (
              <>
                <ShieldOff className="mr-2 h-4 w-4" />
                取消管理员
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                设为管理员
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除用户
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除用户</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除用户 {user.email} 吗？此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteUserMutation.isPending ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 状态切换确认对话框 */}
      <AlertDialog open={showToggleDialog} onOpenChange={setShowToggleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.isActive ? '禁用用户' : '激活用户'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              您确定要{user.isActive ? '禁用' : '激活'}用户 {user.email} 吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              disabled={isPending}
            >
              {toggleStatusMutation.isPending
                ? '处理中...'
                : `确认${user.isActive ? '禁用' : '激活'}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 管理员权限切换确认对话框 */}
      <AlertDialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.isAdmin ? '取消管理员权限' : '设为管理员'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              您确定要{user.isAdmin ? '取消' : '授予'}用户 {user.email}{' '}
              的管理员权限吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleAdmin} disabled={isPending}>
              {updateUserMutation.isPending ? '处理中...' : '确认操作'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
