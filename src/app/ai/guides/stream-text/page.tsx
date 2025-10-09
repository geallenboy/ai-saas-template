'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState } from 'react'
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation'
import { Message, MessageContent } from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function StreamTextPage() {
  const [input, setInput] = useState('')

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/guides/stream-text',
    }),
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">文本流式生成示例</CardTitle>
          <p className="text-muted-foreground">
            使用 AI SDK 的 streamText 功能实现实时流式文本生成
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">功能特点：</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 使用 streamText API 进行实时流式生成</li>
              <li>• 支持 useChat Hook 简化开发</li>
              <li>• 实时显示生成内容，提升用户体验</li>
              <li>• 使用 ai-elements 组件优化界面</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">开始流式对话</p>
                <p className="text-sm">
                  输入问题后，你将看到 AI 实时生成回复内容
                </p>
              </div>
            ) : (
              messages.map(message => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.parts?.map((part, partIndex) => {
                      if (part.type === 'text') {
                        return (
                          <div
                            key={`${message.id}-${partIndex}`}
                            className="whitespace-pre-wrap"
                          >
                            {part.text}
                          </div>
                        )
                      }
                      return null
                    })}
                  </MessageContent>
                </Message>
              ))
            )}
            {(status === 'submitted' || status === 'streaming') && (
              <Message from="assistant">
                <MessageContent>
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse h-3 w-3 bg-primary rounded-full" />
                    <span className="text-sm text-muted-foreground">
                      正在思考...
                    </span>
                  </div>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
        </Conversation>

        <PromptInput
          onSubmit={message => {
            if (message.text?.trim() && status === 'ready') {
              sendMessage({
                parts: [{ type: 'text', text: message.text }],
              })
              setInput('')
            }
          }}
        >
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="输入你的问题，体验实时流式生成..."
              disabled={status !== 'ready'}
              className="min-h-[60px]"
            />
            <PromptInputSubmit
              disabled={!input.trim() || status !== 'ready'}
              status={status}
            />
          </PromptInputBody>
        </PromptInput>
      </div>
    </div>
  )
}
