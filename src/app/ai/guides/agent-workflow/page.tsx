'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Bot, Send, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool'

export default function AgentWorkflowPage() {
  const [inputValue, setInputValue] = useState('')

  const transport = new DefaultChatTransport({
    api: '/api/ai/guides/agent-workflow',
  })

  const { messages, sendMessage, status, setMessages } =
    useChat({ transport })

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    sendMessage({ text: inputValue })
    setInputValue('')
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-purple-500" />
          <h1 className="font-medium">AI Agent 工作流示例</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setMessages([])}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <Bot className="h-12 w-12 opacity-30" />
            <p className="text-sm">Agent 可以使用搜索、天气、计算器等工具来回答问题</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-muted px-3 py-1">北京天气怎么样？</span>
              <span className="rounded-full bg-muted px-3 py-1">帮我算一下 15% 的 2580 是多少</span>
              <span className="rounded-full bg-muted px-3 py-1">搜索 Next.js 16 新特性</span>
            </div>
          </div>
        )}
        {messages.map(message => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] space-y-2 ${message.role === 'user' ? '' : 'w-full'}`}>
              {message.parts.map((part, i) => {
                if (part.type === 'text' && part.text.trim()) {
                  return (
                    <div
                      key={`${message.id}-${i}`}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {part.text}
                    </div>
                  )
                }
                if ('state' in part && 'input' in part) {
                  const toolPart = part as { type: string; state: string; input: unknown; output?: unknown; errorText?: string }
                  return (
                    <Tool key={`${message.id}-${i}`}>
                      <ToolHeader type={toolPart.type as `tool-${string}`} state={toolPart.state as any} />
                      <ToolContent>
                        <ToolInput input={toolPart.input} />
                        {toolPart.output !== undefined && (
                          <ToolOutput output={toolPart.output} errorText={toolPart.errorText} />
                        )}
                      </ToolContent>
                    </Tool>
                  )
                }
                return null
              })}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t p-3 flex gap-2">
        <input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="让 Agent 帮你做点什么..."
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          disabled={isLoading}
        />
        <Button type="submit" size="sm" disabled={isLoading || !inputValue.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
