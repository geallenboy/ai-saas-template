'use client'

import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import type { AiChatSession } from '@/drizzle/schemas'
import { SessionList } from './session-list'

interface ChatSidebarProps {
  // 桌面端侧边栏
  sessions: AiChatSession[]
  selectedSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
  isLoading: boolean

  // 移动端侧边栏
  isSheetOpen: boolean
  onSheetOpenChange: (open: boolean) => void
}

export function ChatSidebar({
  sessions,
  selectedSessionId,
  onSelectSession,
  onNewChat,
  isLoading,
  isSheetOpen,
  onSheetOpenChange,
}: ChatSidebarProps) {
  return (
    <>
      {/* 桌面端侧边栏 */}
      <aside className="hidden md:flex w-80 flex-col border-r border-border/40 bg-muted/30">
        <div className="flex h-14 items-center justify-between px-4 border-b border-border/40">
          <h2 className="font-semibold text-foreground">AIChat</h2>
          <Button
            onClick={onNewChat}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
        <SessionList
          onNewChat={onNewChat}
          onSelect={onSelectSession}
          onSearchChange={() => {}}
          selectedId={selectedSessionId}
          sessions={sessions}
          isLoading={isLoading}
          searchValue=""
        />
      </aside>

      {/* 移动端侧边栏 */}
      <Sheet open={isSheetOpen} onOpenChange={onSheetOpenChange}>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex h-14 items-center justify-between px-4 border-b border-border/40">
            <h2 className="font-semibold text-foreground">会话列表</h2>
          </div>
          <SessionList
            onNewChat={onNewChat}
            onSelect={onSelectSession}
            onSearchChange={() => {}}
            selectedId={selectedSessionId}
            sessions={sessions}
            isLoading={isLoading}
            searchValue=""
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
