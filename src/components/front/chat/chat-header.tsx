'use client'

import { DownloadIcon, MenuIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'
import type { AiChatSession } from '@/drizzle/schemas'
import { trpc } from '@/server/client'

interface ChatHeaderProps {
  currentSession?: AiChatSession | null
  onOpenSidebar?: () => void
}

export function ChatHeader({
  currentSession,
  onOpenSidebar,
}: ChatHeaderProps) {
  const [isExporting, setIsExporting] = useState(false)
  const utils = trpc.useUtils()

  const handleExport = useCallback(
    async (format: 'markdown' | 'json') => {
      if (!currentSession?.id) return
      setIsExporting(true)
      try {
        const result = await utils.aichat.exportChat.fetch({
          sessionId: currentSession.id,
          format,
        })

        // Trigger browser download
        const blob = new Blob([result.content], { type: result.mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success('导出成功')
      } catch (error) {
        console.error('Export failed:', error)
        toast.error('导出失败，请稍后重试')
      } finally {
        setIsExporting(false)
      }
    },
    [currentSession?.id, utils]
  )

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

      {currentSession && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isExporting}>
              <DownloadIcon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">导出</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('markdown')}>
              导出为 Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('json')}>
              导出为 JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  )
}
