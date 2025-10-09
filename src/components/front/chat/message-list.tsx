'use client'

import { formatDistanceToNow } from 'date-fns'
import { Check, Copy } from 'lucide-react'
import { Loader } from '@/components/ai-elements/loader'
import { MessageAvatar } from '@/components/ai-elements/message'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { AiMessageRoles } from '@/drizzle/schemas'
import { cn } from '@/lib/utils'
import type { UIChatMessage } from './chat-message'

export interface PromptSuggestion {
  title: string
  description: string
  content: string
}

const DEFAULT_ASSISTANT_AVATAR = ''
type ChatMessageRole = (typeof AiMessageRoles)[number]

const roleToLabel: Record<ChatMessageRole, string> = {
  system: '系统',
  user: '我',
  assistant: '助手',
}

interface MessageListProps {
  messages: UIChatMessage[]
  isLoading: boolean
  userName: string
  onCopy: (message: UIChatMessage) => void
  copiedMessageId: string | null
  suggestions: PromptSuggestion[]
  onSuggestionSelect: (suggestion: PromptSuggestion) => void
  isStreaming: boolean
}

export function MessageList({
  messages,
  isLoading,
  userName,
  onCopy,
  copiedMessageId,
  suggestions,
  onSuggestionSelect,
  isStreaming,
}: MessageListProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="text-muted-foreground" size={20} />
      </div>
    )
  }

  if (!messages.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-8 px-6 py-12 text-center">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-foreground">
            早上好，AIGC-研究室
          </h1>
        </div>

        {/* 功能标签 */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-2xl">
          <Button variant="outline" size="sm" className="h-8 rounded-full">
            📊 图像生成
          </Button>
          <Button variant="outline" size="sm" className="h-8 rounded-full">
            ✨ 帮我写作
          </Button>
          <Button variant="outline" size="sm" className="h-8 rounded-full">
            📝 编程
          </Button>
          <Button variant="outline" size="sm" className="h-8 rounded-full">
            📚 翻译
          </Button>
          <Button variant="outline" size="sm" className="h-8 rounded-full">
            🎥 视频生成
          </Button>
          <Button variant="outline" size="sm" className="h-8 rounded-full">
            📧 AI PPT
          </Button>
          <Button variant="outline" size="sm" className="h-8 rounded-full">
            🔄 更多
          </Button>
        </div>

        {/* 快速建议 */}
        <div className="grid w-full max-w-2xl gap-3 md:grid-cols-2">
          {suggestions.slice(0, 4).map(suggestion => (
            <button
              key={suggestion.title}
              className="group flex flex-col rounded-xl border border-border/60 bg-card/50 p-4 text-left transition hover:bg-card/80 hover:border-primary/40"
              onClick={() => onSuggestionSelect(suggestion)}
              type="button"
            >
              <span className="text-sm font-medium text-foreground">
                {suggestion.title}
              </span>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {suggestion.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
      {messages.map(message => {
        const isUser = message.role === 'user'
        const displayName = isUser ? userName : roleToLabel[message.role]
        const timestamp = formatDistanceToNow(message.createdAt, {
          addSuffix: true,
        })
        const isCopied = copiedMessageId === message.id

        return (
          <div
            key={message.id}
            className={cn(
              'group relative flex w-full items-start gap-3',
              isUser ? 'flex-row-reverse text-right' : 'flex-row'
            )}
          >
            <MessageAvatar
              className={cn(
                'size-9 shadow-sm ring-1',
                isUser ? 'ring-primary/40' : 'ring-border/60'
              )}
              name={displayName}
              src={isUser ? undefined : DEFAULT_ASSISTANT_AVATAR}
            />
            <div
              className={cn(
                'flex max-w-3xl flex-col gap-2',
                isUser ? 'items-end' : 'items-start'
              )}
            >
              <div
                className={cn(
                  'w-full rounded-3xl border px-5 py-4 text-sm leading-relaxed shadow-sm transition-colors backdrop-blur',
                  isUser
                    ? 'ml-auto border-primary/40 bg-primary text-primary-foreground'
                    : 'mr-auto border-border/60 bg-card/80 text-card-foreground'
                )}
              >
                <div
                  className={cn(
                    'flex items-center gap-2 text-xs',
                    isUser
                      ? 'justify-end text-primary-foreground/80'
                      : 'text-muted-foreground'
                  )}
                >
                  <span>{displayName}</span>
                  <span>·</span>
                  <span>{timestamp}</span>
                  {message.status === 'streaming' && (
                    <Loader className="text-primary" size={14} />
                  )}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                  {message.text ||
                    (message.status === 'streaming' ? '思考中…' : '')}
                </p>
              </div>
              <div
                className={cn(
                  'flex items-center gap-2 text-xs text-muted-foreground transition-opacity',
                  isUser ? 'justify-end' : 'justify-start',
                  'opacity-0 group-hover:opacity-100'
                )}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="size-7 rounded-full border border-transparent bg-background/60 hover:border-border"
                      onClick={() => onCopy(message)}
                      type="button"
                      variant="ghost"
                      size="icon"
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={isUser ? 'left' : 'right'}>
                    {isCopied ? '已复制' : '复制内容'}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        )
      })}

      {isStreaming && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex size-2 animate-pulse rounded-full bg-primary" />
          助手正在继续生成…
        </div>
      )}
    </div>
  )
}
