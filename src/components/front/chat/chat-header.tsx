'use client'

import { MenuIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'
import type { AiChatSession } from '@/drizzle/schemas'

interface ChatHeaderProps {
  currentSession?: AiChatSession | null
  onOpenSidebar?: () => void
}

export function ChatHeader({
  currentSession,

  onOpenSidebar,
}: ChatHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between px-4 border-b border-border/40 bg-background/80 backdrop-blur">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="md:hidden"
              variant="ghost"
              size="sm"
              onClick={onOpenSidebar}
            >
              <MenuIcon className="h-4 w-4" />
            </Button>
          </SheetTrigger>
        </Sheet>
        <div>
          <h1 className="font-medium text-foreground">
            {currentSession?.title || '早上好，AIGC-研究室'}
          </h1>
          {currentSession && (
            <p className="text-xs text-muted-foreground">内容由 AI 生成</p>
          )}
        </div>
      </div>
    </header>
  )
}
