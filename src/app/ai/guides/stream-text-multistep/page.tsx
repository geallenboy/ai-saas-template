'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ListTodoIcon, WorkflowIcon } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function StreamTextMultistepPage() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/guides/stream-text-multistep',
    }),
  })

  const suggestedTasks = [
    '制定一个学习 React 的完整计划',
    '规划一次为期一周的日本旅行',
    '设计一个健康的减肥计划',
    '创建一个新产品的市场营销策略',
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <WorkflowIcon className="h-6 w-6" />
            多步骤文本流式生成示例
          </CardTitle>
          <p className="text-muted-foreground">
            体验 AI 如何将复杂任务分解为多个步骤并逐步完成
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">功能特点：</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 自动分解复杂任务为多个步骤</li>
              <li>• 实时流式显示每个步骤的进展</li>
              <li>• 智能目标提取和规划</li>
              <li>• 结构化的任务执行流程</li>
            </ul>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              🎯 非常适合处理需要规划和分步执行的复杂任务
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ListTodoIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">开始多步骤任务规划</p>
                <p className="text-sm">
                  描述一个复杂的任务，AI 将为您制定详细的执行计划
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
                        case 'tool-extractGoal':
                          return (
                            <div
                              key={`${message.id}-goal-${partIndex}`}
                              className="my-4"
                            >
                              <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                  <ListTodoIcon className="h-4 w-4 text-orange-600" />
                                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                                    目标提取和步骤分解
                                  </span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                                  <pre className="text-xs overflow-auto text-muted-foreground">
                                    {JSON.stringify(part, null, 2)}
                                  </pre>
                                </div>
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
                    <span>正在分析和规划任务步骤...</span>
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
                  sendMessage({ text: message.text })
                  setInput('')
                }
              }}
            >
              <PromptInputBody>
                <PromptInputTextarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="描述一个需要多步骤完成的复杂任务..."
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
              {suggestedTasks.map((task, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(task)}
                  disabled={status !== 'ready'}
                  className="w-full text-left justify-start h-auto py-2 px-3 whitespace-normal"
                >
                  {task}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
