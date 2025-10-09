'use client'

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'
import { Button } from '@/components/ui/button'

export interface UIChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
  status: 'pending' | 'completed' | 'error' | 'streaming' | 'failed'
  createdAt: Date
}

interface ChatMessageProps {
  messages: UIChatMessage[]
}

export function ChatMessage({ messages }: ChatMessageProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden mx-auto w-full">
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-8 px-6 py-12 text-center">
              <div className="flex flex-col gap-3">
                <h1 className="text-2xl font-semibold text-foreground">
                  早上好，AIGC-研究室
                </h1>
              </div>

              {/* 功能标签 */}
              <div className="flex flex-wrap items-center justify-center gap-3 max-w-2xl">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full"
                >
                  📊 图像生成
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full"
                >
                  ✨ 帮我写作
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full"
                >
                  📝 编程
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full"
                >
                  📚 翻译
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full"
                >
                  🎥 视频生成
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full"
                >
                  📧 AI PPT
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full"
                >
                  🔄 更多
                </Button>
              </div>
            </div>
          ) : (
            messages.map(message => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  <Response>{message.text}</Response>
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  )
}
