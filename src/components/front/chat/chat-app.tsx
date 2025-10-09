'use client'

import { skipToken } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { ProtectedRoute } from '@/components/auth'
import type {
  AiChatMessage,
  AiChatSession,
  AiMessageRoles,
  AiMessageStatuses,
} from '@/drizzle/schemas'
import { trpc } from '@/server/client'
import type { SendMessageInput } from '@/server/routers/aichat'
import { ChatHeader } from './chat-header'
import { ChatInput } from './chat-input'
import { ChatMessage, type UIChatMessage } from './chat-message'
import { ChatSidebar } from './chat-sidebar'
import { processStreamEvent } from './process-stream-event'

type ChatMessageRole = (typeof AiMessageRoles)[number]
type ChatMessageStatus = (typeof AiMessageStatuses)[number] | 'pending'

const EMPTY_UUID = '00000000-0000-0000-0000-000000000000'

export function ChatApp() {
  const utils = trpc.useUtils()

  // Session management
  const sessionsQuery = trpc.aichat.listSessions.useQuery(undefined, {
    refetchInterval: 60_000,
  })
  const [sessionList, setSessionList] = useState<AiChatSession[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  )

  // UI state
  const [isSessionSheetOpen, setSessionSheetOpen] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)

  // Messages
  const [messages, setMessages] = useState<UIChatMessage[]>([])
  const pendingInputRef = useRef('')
  const sessionIdRef = useRef<string | null>(null)
  const [streamInput, setStreamInput] = useState<SendMessageInput | null>(null)

  useEffect(() => {
    if (sessionsQuery.data) {
      setSessionList(sessionsQuery.data)
    }
  }, [sessionsQuery.data])

  useEffect(() => {
    if (selectedSessionId) return
    if (sessionList.length > 0) {
      setSelectedSessionId(sessionList[0]?.id ?? null)
    }
  }, [selectedSessionId, sessionList])

  const activeSessionId = selectedSessionId ?? EMPTY_UUID

  const messagesQuery = trpc.aichat.getSessionMessages.useQuery(
    { sessionId: activeSessionId },
    {
      enabled: Boolean(selectedSessionId),
      refetchOnWindowFocus: false,
    }
  )

  useEffect(() => {
    if (!messagesQuery.data) {
      if (!(messagesQuery.isFetching || selectedSessionId)) {
        setMessages([])
      }
      return
    }

    setMessages(prev => {
      const merged = new Map<string, UIChatMessage>()

      for (const message of prev) {
        merged.set(message.id, message)
      }

      for (const raw of messagesQuery.data as AiChatMessage[]) {
        merged.set(raw.id, {
          id: raw.id,
          role: raw.role as ChatMessageRole,
          text: raw.text ?? '',
          status: raw.status as ChatMessageStatus,
          createdAt: raw.createdAt,
        })
      }

      return Array.from(merged.values()).sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      )
    })
  }, [messagesQuery.data, messagesQuery.isFetching, selectedSessionId])

  const subscriptionInput = streamInput ?? skipToken

  trpc.aichat.sendMessage.useSubscription(subscriptionInput, {
    onData: event => {
      sessionIdRef.current = processStreamEvent({
        event,
        text: pendingInputRef.current,
        sessionId: sessionIdRef.current,
        setSelectedSessionId,
        setMessages,
        utils,
        setSessionSheetOpen,
      })
    },
    onError: error => {
      console.error('AI stream error', error)
      toast.error('生成回答失败，请稍后重试')
      setIsStreaming(false)
      setStreamInput(null)
      pendingInputRef.current = ''
    },
    onComplete: () => {
      setIsStreaming(false)
      setStreamInput(null)
      pendingInputRef.current = ''
    },
  })

  const handleSelectSession = useCallback((sessionId: string) => {
    setSelectedSessionId(sessionId)
    setSessionSheetOpen(false)
  }, [])

  const handleNewChat = useCallback(() => {
    setSelectedSessionId(null)
    setMessages([])
  }, [])

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text)
      const hasAttachments = Boolean(message.files?.length)

      if (!(hasText || hasAttachments)) {
        return
      }

      if (isStreaming) {
        toast.info('当前仍在生成回答，请稍候')
        return
      }

      setIsStreaming(true)

      const initialSessionId = selectedSessionId
      sessionIdRef.current = initialSessionId

      const activeSession = initialSessionId
        ? sessionList.find(item => item.id === initialSessionId)
        : null

      const text = message.text || '发送了附件'
      pendingInputRef.current = text

      setStreamInput({
        sessionId: initialSessionId ?? undefined,
        message: text,
        systemPrompt: activeSession?.systemPrompt ?? undefined,
        modelId: selectedModel,
        callSettings: undefined,
        providerOptions: undefined,
      })
    },
    [isStreaming, selectedSessionId, sessionList, selectedModel]
  )

  const currentSession = sessionList.find(s => s.id === selectedSessionId)

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <ChatSidebar
          sessions={sessionList}
          selectedSessionId={selectedSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          isLoading={sessionsQuery.isLoading}
          isSheetOpen={isSessionSheetOpen}
          onSheetOpenChange={setSessionSheetOpen}
        />

        {/* 主聊天区域 */}
        <main className="flex-1 flex flex-col min-w-0">
          <ChatHeader
            currentSession={currentSession}
            onNewChat={handleNewChat}
            onOpenSidebar={() => setSessionSheetOpen(true)}
          />

          <ChatMessage messages={messages} />

          <ChatInput
            onSubmit={handleSubmit}
            isStreaming={isStreaming}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            webSearchEnabled={webSearchEnabled}
            onWebSearchToggle={() => setWebSearchEnabled(!webSearchEnabled)}
          />
        </main>
      </div>
    </ProtectedRoute>
  )
}
