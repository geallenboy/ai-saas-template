'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Network, Settings2Icon } from 'lucide-react'
import { useState } from 'react'
import type { ChatMessage } from '@/app/api/ai/guides/call-tools-multiple-steps/route'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CallToolsMultipleStepsPage() {
  const [input, setInput] = useState('')

  const { messages, sendMessage, status } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: '/api/ai/guides/call-tools-multiple-steps',
    }),
  })

  const suggestedQueries = [
    '北京今天的天气怎么样？然后根据天气情况推荐适合的户外活动',
    '我在上海，请告诉我当前位置，然后推荐附近的餐厅',
    '查询今天的天气，如果适合出行就推荐一个旅游景点',
    '获取我的位置信息，然后根据当地天气推荐合适的穿衣建议',
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6" />
            多步骤工具调用示例
          </CardTitle>
          <p className="text-muted-foreground">
            体验 AI 如何连续调用多个工具来完成复杂的任务
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">功能特点：</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 支持连续调用多个外部工具</li>
              <li>• 智能工具选择和执行顺序</li>
              <li>• 工具间结果传递和关联</li>
              <li>• 复杂任务的自动化处理</li>
            </ul>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              🔗 AI 会根据任务需要自动选择和组合多个工具
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Settings2Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">开始多步骤工具调用</p>
                <p className="text-sm">
                  描述一个需要多步骤完成的任务，AI 将自动调用相关工具
                </p>
              </div>
            ) : (
              messages.map(message => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.parts?.map((part, partIndex) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <div
                              key={`${message.id}-text-${partIndex}`}
                              className="whitespace-pre-wrap"
                            >
                              {part.text}
                            </div>
                          )
                        case 'tool-getLocation':
                        case 'tool-getWeather':
                          return (
                            <div
                              key={`${message.id}-${part.type}-${partIndex}`}
                              className="mt-4"
                            >
                              <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Settings2Icon className="h-4 w-4 text-indigo-600" />
                                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                    {part.type === 'tool-getLocation'
                                      ? '位置获取工具'
                                      : '天气查询工具'}
                                  </span>
                                </div>
                                <details className="group">
                                  <summary className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-700">
                                    查看工具调用详情
                                  </summary>
                                  <pre className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-xs overflow-auto">
                                    {JSON.stringify(part, null, 2)}
                                  </pre>
                                </details>
                              </div>
                            </div>
                          )
                        default:
                          return null
                      }
                    })}
                  </MessageContent>
                </Message>
              ))
            )}
            {(status === 'submitted' || status === 'streaming') && (
              <Message from="assistant">
                <MessageContent>
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    <span>正在执行多步骤工具调用...</span>
                  </div>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
        </Conversation>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PromptInput
              onSubmit={message => {
                if (message.text?.trim() && status === 'ready') {
                  sendMessage({
                    text: message.text,
                  })
                  setInput('')
                }
              }}
            >
              <PromptInputBody>
                <PromptInputTextarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="描述一个需要多步骤工具调用的任务..."
                  disabled={status !== 'ready'}
                  className="min-h-[80px]"
                />
                <PromptInputSubmit
                  disabled={!input.trim() || status !== 'ready'}
                  status={status}
                />
              </PromptInputBody>
            </PromptInput>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">任务建议</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                点击下面的建议来快速开始：
              </p>
              {suggestedQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(query)}
                  disabled={status !== 'ready'}
                  className="w-full text-left justify-start h-auto py-2 px-3 whitespace-normal"
                >
                  {query}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
