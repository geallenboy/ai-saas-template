'use client'

import type { ModelMessage } from 'ai'
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

export default function GenerateTextPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ModelMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ModelMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/guides/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
        }),
      })

      if (!response.ok) {
        throw new Error('生成失败')
      }

      const { messages: responseMessages } = await response.json()
      setMessages(currentMessages => [...currentMessages, ...responseMessages])
    } catch (error) {
      console.error('生成错误:', error)
      setMessages(currentMessages => [
        ...currentMessages,
        {
          role: 'assistant',
          content: '抱歉，生成过程中出现了错误，请重试。',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">文本生成示例</CardTitle>
          <p className="text-muted-foreground">
            使用 AI SDK 的 generateText 功能生成高质量的文本内容
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">功能特点：</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 使用 generateText API 进行文本生成</li>
              <li>• 支持多轮对话上下文</li>
              <li>• 完整的错误处理和加载状态</li>
              <li>• 使用 ai-elements 组件优化 UI</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">开始你的第一次对话</p>
                <p className="text-sm">输入任何问题或话题，AI 将为你生成回复</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <Message
                  key={index}
                  from={message.role as 'user' | 'assistant' | 'system'}
                >
                  <MessageContent>
                    {typeof message.content === 'string'
                      ? message.content
                      : message.content
                          ?.filter(part => part.type === 'text')
                          .map((part, partIndex) => (
                            <div key={partIndex}>{part.text}</div>
                          ))}
                  </MessageContent>
                </Message>
              ))
            )}
            {isLoading && (
              <Message from="assistant">
                <MessageContent>
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    <span>正在生成回复...</span>
                  </div>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
        </Conversation>

        <PromptInput
          onSubmit={message => {
            if (message.text?.trim() && !isLoading) {
              setInput(message.text)
              handleSubmit()
            }
          }}
        >
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="输入你的问题或话题..."
              disabled={isLoading}
              className="min-h-[60px]"
            />
            <PromptInputSubmit disabled={!input.trim() || isLoading} />
          </PromptInputBody>
        </PromptInput>
      </div>
    </div>
  )
}
