'use client'
import { SparklesIcon } from 'lucide-react'
import type { AiChatSession } from '@/drizzle/schemas'
import { DEFAULT_AI_MODEL_ID } from '@/lib/ai-sdk'

interface ConversationHeaderProps {
  session: AiChatSession | null
  isStreaming: boolean
}

/** 会话头部
 * @param param0
 * @returns
 */
export function ConversationHeader({
  session,
  isStreaming,
}: ConversationHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2 px-6 py-4">
      <div>
        <h2 className="text-lg font-semibold">
          {session?.title || '新的对话'}
        </h2>
        <p className="text-xs text-muted-foreground">
          模型：{session?.modelId || DEFAULT_AI_MODEL_ID}
        </p>
      </div>
      {isStreaming && (
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
          <SparklesIcon className="h-4 w-4 animate-pulse" />
          正在生成...
        </div>
      )}
    </div>
  )
}
