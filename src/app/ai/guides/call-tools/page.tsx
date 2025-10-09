'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { WrenchIcon } from 'lucide-react'
import { useState } from 'react'
import type { ChatMessage } from '@/app/api/ai/guides/call-tools/route'
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

export default function CallToolsPage() {
  const [input, setInput] = useState('')

  const { messages, sendMessage, status } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: '/api/ai/guides/call-tools',
    }),
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <WrenchIcon className="h-6 w-6" />
            工具调用示例
          </CardTitle>
          <p className="text-muted-foreground">
            学习如何构建一个可以调用外部工具来回答问题的聊天机器人
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">功能特点：</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 集成外部工具和 API 调用</li>
              <li>• 智能判断何时使用工具</li>
              <li>• 展示工具调用过程和结果</li>
              <li>• 支持多种工具类型（天气查询等）</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 试试问一些需要实时信息的问题，比如："北京今天的天气怎么样？"
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <WrenchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">开始与工具增强的 AI 对话</p>
                <p className="text-sm">AI 可以调用外部工具来获取实时信息</p>
              </div>
            ) : (
              messages.map(message => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.parts.map((part, partIndex) => {
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
                        case 'tool-getWeather':
                          return (
                            <div
                              key={`${message.id}-weather-${partIndex}`}
                              className="mt-4"
                            >
                              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <WrenchIcon className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    天气查询工具
                                  </span>
                                </div>
                                <details className="group">
                                  <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
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
                          return (
                            <div
                              key={`${message.id}-unknown-${partIndex}`}
                              className="mt-4"
                            >
                              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <WrenchIcon className="h-4 w-4 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    工具调用
                                  </span>
                                </div>
                                <pre className="text-xs overflow-auto">
                                  {JSON.stringify(part, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )
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
                    <span>正在思考并可能调用工具...</span>
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
              placeholder="询问需要实时信息的问题，比如天气、时间等..."
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
