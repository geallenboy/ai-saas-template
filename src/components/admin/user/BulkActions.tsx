'use client'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BULK_ACTIONS } from '@/constants/user'
import { trpc } from '@/server/client'

interface BulkActionsProps {
  selectedUserIds: string[]
  onSuccess: () => void
}

export function BulkActions({ selectedUserIds, onSuccess }: BulkActionsProps) {
  const [selectedAction, setSelectedAction] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [state, setState] = useState<{
    success?: boolean
    error?: string
    message?: string
  } | null>(null)

  const utils = trpc.useUtils()
  const bulkUpdateMutation = trpc.users.bulkUpdateUsers.useMutation({
    onSuccess: () => {
      // 刷新用户列表和统计数据
      utils.users.getUsers.invalidate()
      utils.users.getUserStats.invalidate()

      setState({
        success: true,
        message: `成功更新 ${selectedUserIds.length} 个用户`,
      })
      onSuccess()
    },
    onError: (error: any) => {
      setState({
        success: false,
        error: error.message || '操作失败，请重试',
      })
    },
    onSettled: () => {
      setShowConfirm(false)
      setSelectedAction('')
    },
  })

  const handleActionSelect = (action: string) => {
    setSelectedAction(action)
    const actionConfig = BULK_ACTIONS.find(a => a.value === action)

    if (actionConfig?.requiresConfirm) {
      setShowConfirm(true)
    } else {
      executeAction(action)
    }
  }

  const executeAction = async (action: string) => {
    const updates: {
      isActive?: boolean
      isAdmin?: boolean
      adminLevel?: number
    } = {}

    switch (action) {
      case 'activate':
        updates.isActive = true
        break
      case 'deactivate':
        updates.isActive = false
        break
      case 'promote':
        updates.isAdmin = true
        updates.adminLevel = 1
        break
      case 'demote':
        updates.isAdmin = false
        updates.adminLevel = 0
        break
      default:
        return
    }

    bulkUpdateMutation.mutate({
      userIds: selectedUserIds,
      updates,
    })
  }

  const selectedActionConfig = BULK_ACTIONS.find(
    a => a.value === selectedAction
  )

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-4">
          <p className="text-sm font-medium">
            已选择 {selectedUserIds.length} 个用户
          </p>

          <div className="flex items-center space-x-2">
            <Select value={selectedAction} onValueChange={handleActionSelect}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="选择操作" />
              </SelectTrigger>
              <SelectContent>
                {BULK_ACTIONS.map(action => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        {state?.success && (
          <p className="text-sm text-green-600">{state.message}</p>
        )}
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量操作</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要对选中的 {selectedUserIds.length} 个用户执行 「
              {selectedActionConfig?.label}」操作吗？
              {selectedAction === 'delete' && (
                <span className="block mt-2 text-red-600 font-medium">
                  注意：删除操作不可恢复！
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkUpdateMutation.isPending}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => executeAction(selectedAction)}
              disabled={bulkUpdateMutation.isPending}
              className={
                selectedAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''
              }
            >
              {bulkUpdateMutation.isPending ? '执行中...' : '确认执行'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
