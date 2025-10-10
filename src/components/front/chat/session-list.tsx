'use client'

import { formatDistanceToNow } from 'date-fns'
import {
  Check,
  Edit2,
  LoaderIcon,
  MoreHorizontal,
  PlusIcon,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { AiChatSession } from '@/drizzle/schemas'
import { cn } from '@/lib/utils'
import { trpc } from '@/server/client'

interface SessionListProps {
  sessions: AiChatSession[]
  selectedId: string | null
  onSelect: (sessionId: string) => void
  onNewChat: () => void
  isLoading: boolean
  isCreatingNewChat: boolean // 新建对话的加载状态
  searchValue: string
  onSearchChange: (value: string) => void
}

/**
 *  会话列表
 * @param param0
 * @returns
 */
export function SessionList({
  sessions,
  selectedId,
  onSelect,
  onNewChat,
  isLoading,
  searchValue,
  onSearchChange,
  isCreatingNewChat,
}: SessionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)

  const utils = trpc.useUtils()

  // 删除会话mutation
  const deleteSessionMutation = trpc.aichat.deleteSession.useMutation({
    onSuccess: () => {
      toast.success('会话已删除')
      utils.aichat.listSessions.invalidate()
      setDeleteDialogOpen(false)
      setSessionToDelete(null)
      // 如果删除的是当前选中的会话，跳转到新对话
      if (selectedId === sessionToDelete) {
        onNewChat()
      }
    },
    onError: error => {
      toast.error(error.message || '删除失败')
    },
  })

  // 更新会话mutation
  const updateSessionMutation = trpc.aichat.updateSession.useMutation({
    onSuccess: () => {
      toast.success('会话名称已更新')
      utils.aichat.listSessions.invalidate()
      setEditingId(null)
      setEditingTitle('')
    },
    onError: error => {
      toast.error(error.message || '更新失败')
    },
  })

  const filteredSessions = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase()
    if (!keyword) {
      return sessions
    }

    return sessions.filter(session =>
      (session.title ?? '').toLowerCase().includes(keyword)
    )
  }, [sessions, searchValue])

  const handleStartEdit = (session: AiChatSession) => {
    setEditingId(session.id)
    setEditingTitle(session.title || '')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  const handleSaveEdit = () => {
    if (!(editingId && editingTitle.trim())) return

    updateSessionMutation.mutate({
      sessionId: editingId,
      title: editingTitle.trim(),
    })
  }

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      deleteSessionMutation.mutate({ sessionId: sessionToDelete })
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <Button
          className="w-full"
          onClick={onNewChat}
          variant="secondary"
          disabled={isCreatingNewChat}
        >
          {isCreatingNewChat ? (
            <>
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              创建中...
            </>
          ) : (
            <>
              <PlusIcon className="mr-2 h-4 w-4" />
              新建对话
            </>
          )}
        </Button>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoComplete="off"
            className="pl-9 text-sm"
            placeholder="搜索历史对话"
            value={searchValue}
            onChange={event => onSearchChange(event.target.value)}
          />
        </div>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {isLoading && !sessions.length ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton className="h-12 w-full" key={index} />
              ))}
            </div>
          ) : filteredSessions.length ? (
            filteredSessions.map(session => (
              <div
                key={session.id}
                className={cn(
                  'group relative w-full rounded-lg transition hover:bg-muted',
                  selectedId === session.id && 'bg-muted'
                )}
              >
                <button
                  className="w-full px-3 py-3 text-left"
                  onClick={() =>
                    editingId !== session.id && onSelect(session.id)
                  }
                  type="button"
                  disabled={editingId === session.id}
                >
                  <div className="flex items-center justify-between">
                    {editingId === session.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingTitle}
                          onChange={e => setEditingTitle(e.target.value)}
                          className="text-sm h-6 flex-1"
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              handleSaveEdit()
                            } else if (e.key === 'Escape') {
                              handleCancelEdit()
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={handleSaveEdit}
                          disabled={updateSessionMutation.isPending}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="truncate text-sm font-medium flex-1">
                          {session.title || '新建对话'}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={e => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleStartEdit(session)}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              重命名
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(session.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {formatDistanceToNow(
                      session.updatedAt ?? session.createdAt,
                      {
                        addSuffix: true,
                      }
                    )}
                  </p>
                </button>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {sessions.length ? '未找到匹配的会话' : '当前暂无会话'}
            </div>
          )}
        </div>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除会话</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该会话及其所有消息记录，无法恢复。您确定要继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteSessionMutation.isPending}
            >
              {deleteSessionMutation.isPending ? '删除中...' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
