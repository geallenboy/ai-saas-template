'use client'

import { skipToken } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
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

/**
 * ChatApp组件的属性接口
 * @param initialSessionId - 可选的初始对话ID，来自URL参数
 * @param initialMessage - 可选的初始消息，从新对话页面传递过来
 * @param initialModelId - 可选的初始模型ID
 */
interface ChatAppProps {
  initialSessionId?: string
  initialMessage?: string
  initialModelId?: string
}

/**
 * AI聊天应用主组件
 *
 * 路由行为：
 * - /ai/chat - 新对话状态（默认）
 * - /ai/chat/[sessionId] - 特定对话页面
 *
 * 状态管理：
 * - 默认不自动选择任何对话，保持新对话状态
 * - 基于URL参数初始化选中的对话
 * - 用户交互时同步更新URL
 */
export function ChatApp({
  initialSessionId,
  initialMessage,
  initialModelId,
}: ChatAppProps = {}) {
  // 路由和工具实例
  const router = useRouter()
  const utils = trpc.useUtils()
  // 判断是否为新对话模式（没有传入sessionId）
  const isNewChatMode = !initialSessionId
  // Session management
  // 获取用户的所有对话列表，每分钟自动刷新
  const sessionsQuery = trpc.aichat.listSessions.useQuery(undefined, {
    refetchInterval: 60_000,
  })
  // 本地对话列表状态
  const [sessionList, setSessionList] = useState<AiChatSession[]>([])
  // 当前选中的对话ID（null表示新对话状态）
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  )

  // ========== UI界面状态 ==========
  // 移动端侧边栏抽屉是否打开
  const [isSessionSheetOpen, setSessionSheetOpen] = useState(false)
  // AI是否正在生成回答（流式输出状态）
  const [isStreaming, setIsStreaming] = useState(false)
  // 是否正在创建新对话（用于按钮加载状态和用户反馈）
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false)
  // 用户选择的AI模型
  const [selectedModel, setSelectedModel] = useState(initialModelId || 'gpt-4o')
  // 是否启用联网搜索功能
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)

  // ========== 消息处理状态（仅对话模式） ==========
  // 当前对话的消息列表
  const [messages, setMessages] = useState<UIChatMessage[]>([])
  // 保存用户待发送的消息文本（用于流式处理）
  const pendingInputRef = useRef('')
  // 保存当前操作的对话ID（用于流式处理过程中的状态追踪）
  const sessionIdRef = useRef<string | null>(null)
  // 流式输入参数，用于启动AI消息生成
  const [streamInput, setStreamInput] = useState<SendMessageInput | null>(null)
  // ========== Session创建功能 ==========
  const createSessionMutation = trpc.aichat.createSession.useMutation()

  // 根据URL参数初始化选中的对话ID
  // 这是动态路由功能的核心：/ai/chat/[sessionId] 时会传入 initialSessionId
  useEffect(() => {
    if (initialSessionId) {
      setSelectedSessionId(initialSessionId)
    }
  }, [initialSessionId])

  const messagesQuery = trpc.aichat.getSessionMessages.useQuery(
    { sessionId: selectedSessionId || '' },
    {
      enabled: Boolean(selectedSessionId),
      refetchOnWindowFocus: false,
    }
  )
  // 处理消息数据的同步和合并
  // 合并服务器数据和本地流式更新的消息，避免重复和状态冲突
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

      // 按时间排序返回最终的消息列表，如果时间相同则按角色排序（用户消息在前）
      return Array.from(merged.values()).sort((a, b) => {
        const timeDiff = a.createdAt.getTime() - b.createdAt.getTime()
        if (timeDiff !== 0) return timeDiff

        // 如果时间相同，确保用户消息在AI消息前面
        if (a.role === 'user' && b.role === 'assistant') return -1
        if (a.role === 'assistant' && b.role === 'user') return 1
        return 0
      })
    })
  }, [messagesQuery.data, messagesQuery.isFetching, selectedSessionId])

  // 准备流式订阅的输入参数，新对话模式下不启动订阅
  const subscriptionInput =
    isNewChatMode || !streamInput ? skipToken : streamInput
  // 新对话创建后的路由跳转回调
  // 当用户在新对话状态下发送消息时，AI会创建新对话并返回ID
  // 此时自动跳转到新对话的URL，实现URL与状态同步
  const handleNewSessionCreated = useCallback(
    (sessionId: string) => {
      router.push(`/ai/chat/${sessionId}`)
    },
    [router]
  )
  // 流式消息订阅处理
  // 这是AI实时回答的核心订阅，处理各种流式事件
  trpc.aichat.sendMessage.useSubscription(subscriptionInput, {
    // 处理流式数据事件（会话创建、消息开始、内容更新、完成等）
    onData: event => {
      sessionIdRef.current = processStreamEvent({
        event,
        text: pendingInputRef.current,
        sessionId: sessionIdRef.current,
        setSelectedSessionId,
        setMessages,
        utils,
        setSessionSheetOpen, // 控制移动端侧边栏的函数
        onNewSessionCreated: handleNewSessionCreated, // 新对话创建时的路由跳转回调
      })
    },
    // 处理流式错误
    onError: error => {
      console.error('AI stream error', error)
      toast.error('生成回答失败，请稍后重试')
      setIsStreaming(false)
      setStreamInput(null)
      pendingInputRef.current = ''
    },
    // 处理流式完成
    onComplete: () => {
      setIsStreaming(false)
      setStreamInput(null)
      pendingInputRef.current = ''
    },
  })

  /**
   * 处理用户选择特定对话的操作
   * 1. 更新本地选中状态
   * 2. 关闭移动端侧边栏
   * 3. 导航到对应的对话URL
   */
  const handleSelectSession = useCallback(
    (sessionId: string) => {
      setSelectedSessionId(sessionId)
      setSessionSheetOpen(false)
      router.push(`/ai/chat/${sessionId}`)
    },
    [router]
  )

  const handleNewChat = useCallback(async () => {
    setIsCreatingNewChat(true)
    try {
      setSelectedSessionId(null)
      setMessages([])
      router.push('/ai/chat')
    } finally {
      setIsCreatingNewChat(false)
    }
  }, [])
  // 同步服务器返回的对话列表到本地状态
  useEffect(() => {
    if (sessionsQuery.data) {
      setSessionList(sessionsQuery.data)
    }
  }, [sessionsQuery.data])

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const hasText = Boolean(message.text)
      const hasAttachments = Boolean(message.files?.length)

      if (!(hasText || hasAttachments)) {
        return
      }

      // 防止重复发送
      if (isStreaming || isCreatingNewChat) {
        toast.info('正在处理中，请稍候')
        return
      }

      const text = message.text || '发送了附件'

      // 新对话模式：创建session并跳转，不处理消息
      if (isNewChatMode) {
        setIsCreatingNewChat(true)
        try {
          const session = await createSessionMutation.mutateAsync({
            title: text.slice(0, 40), // 使用消息前40字符作为标题
            modelId: selectedModel,
          })

          // 立即跳转到对话页面，并传递消息参数
          const params = new URLSearchParams({
            message: text,
            modelId: selectedModel,
          })
          router.push(`/ai/chat/${session.id}?${params.toString()}`)

          toast.success('正在创建新对话...')
        } catch (error) {
          console.error('创建对话失败:', error)
          toast.error('创建对话失败，请重试')
        } finally {
          setIsCreatingNewChat(false)
        }
        return
      }

      // 对话模式：正常的流式消息处理
      setIsStreaming(true)
      const initialSessionId = selectedSessionId
      sessionIdRef.current = initialSessionId

      const activeSession = initialSessionId
        ? sessionList.find(item => item.id === initialSessionId)
        : null

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
    [
      isStreaming,
      isCreatingNewChat,
      isNewChatMode,
      selectedSessionId,
      sessionList,
      selectedModel,
      createSessionMutation,
      router,
    ]
  )

  // ========== 初始消息自动发送 ==========

  // 发用于标记初始消息是否已处理，防止重复送
  const [initialMessageProcessed, setInitialMessageProcessed] = useState(false)
  // 处理来自新对话页面的初始消息自动发送
  useEffect(() => {
    // 只在对话模式下，且有初始消息，且消息已加载完成，且尚未处理过初始消息时执行
    if (
      !isNewChatMode &&
      initialMessage &&
      selectedSessionId &&
      messagesQuery.data !== undefined && // 消息已加载
      !isStreaming &&
      !streamInput &&
      !initialMessageProcessed // 关键：防止重复处理
    ) {
      // 立即标记为已处理，防止重复触发
      setInitialMessageProcessed(true)

      // 自动发送初始消息
      handleSubmit({ text: initialMessage })

      // 清除URL中的消息参数，避免重复发送
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.delete('message')
      currentUrl.searchParams.delete('modelId')
      window.history.replaceState({}, '', currentUrl.toString())
    }
  }, [
    isNewChatMode,
    initialMessage,
    selectedSessionId,
    messagesQuery.data,
    isStreaming,
    streamInput,
    initialMessageProcessed,
    handleSubmit,
  ])

  // 当sessionId变化时重置初始消息处理标记
  useEffect(() => {
    setInitialMessageProcessed(false)
  }, [selectedSessionId])

  // ========== 渲染组件 ==========

  // 获取当前选中的对话详情（用于显示对话标题等信息）
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
          isCreatingNewChat={isCreatingNewChat}
          onSheetOpenChange={setSessionSheetOpen}
        />

        {/* 主聊天区域 */}
        <main className="flex-1 flex flex-col min-w-0">
          <ChatHeader
            currentSession={currentSession}
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
            isNewChat={!selectedSessionId} // 是否为新对话状态（用于自动聚焦）
          />
        </main>
      </div>
    </ProtectedRoute>
  )
}
