'use client'

import { formatDistanceToNow } from 'date-fns'
import { PlusIcon, Search } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { AiChatSession } from '@/drizzle/schemas'
import { cn } from '@/lib/utils'

interface SessionListProps {
  sessions: AiChatSession[]
  selectedId: string | null
  onSelect: (sessionId: string) => void
  onNewChat: () => void
  isLoading: boolean
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
}: SessionListProps) {
  const filteredSessions = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase()
    if (!keyword) {
      return sessions
    }

    return sessions.filter(session =>
      (session.title ?? '').toLowerCase().includes(keyword)
    )
  }, [sessions, searchValue])

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <Button className="w-full" onClick={onNewChat} variant="secondary">
          <PlusIcon className="mr-2 h-4 w-4" />
          新建对话
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
              <button
                key={session.id}
                className={cn(
                  'w-full rounded-lg px-3 py-3 text-left transition hover:bg-muted',
                  selectedId === session.id && 'bg-muted'
                )}
                onClick={() => onSelect(session.id)}
                type="button"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium">
                    {session.title || '新建对话'}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {formatDistanceToNow(session.updatedAt ?? session.createdAt, {
                    addSuffix: true,
                  })}
                </p>
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {sessions.length ? '未找到匹配的会话' : '当前暂无会话'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
