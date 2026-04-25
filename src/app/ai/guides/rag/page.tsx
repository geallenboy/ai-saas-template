'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { FileText, Send, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function RAGGuidePage() {
  const [documentContext, setDocumentContext] = useState('')
  const [inputValue, setInputValue] = useState('')

  const transport = new DefaultChatTransport({
    api: '/api/ai/guides/rag',
    body: { documentContext },
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
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      <div className="flex w-1/3 min-w-[280px] flex-col gap-3 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4" />
          <span>文档内容 (RAG Context)</span>
        </div>
        <p className="text-xs text-muted-foreground">
          粘贴文档内容到下方，AI 将基于文档回答你的问题。
        </p>
        <Textarea
          value={documentContext}
          onChange={e => setDocumentContext(e.target.value)}
          placeholder="在此粘贴文档内容..."
          className="flex-1 resize-none text-sm"
        />
        <div className="text-xs text-muted-foreground">
          {documentContext.length > 0
            ? `${documentContext.length} 字符`
            : '未提供文档'}
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h2 className="text-sm font-medium">RAG 问答</h2>
          <Button variant="ghost" size="sm" onClick={() => setMessages([])}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              在左侧粘贴文档内容，然后在下方提问
            </div>
          )}
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.parts.map((part, i) =>
                  part.type === 'text' ? (
                    <span key={`${message.id}-${i}`}>{part.text}</span>
                  ) : null
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="border-t p-3 flex gap-2">
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="基于文档提问..."
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
            disabled={isLoading}
          />
          <Button type="submit" size="sm" disabled={isLoading || !inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
