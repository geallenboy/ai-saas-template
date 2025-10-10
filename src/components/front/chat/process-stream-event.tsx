'use client'
import { toast } from 'sonner'
import type { trpc } from '@/server/client'
import type { AiChatStreamEvent } from '@/server/routers/aichat'
import type { UIChatMessage } from './chat-message'

interface ProcessStreamEventArgs {
  event: AiChatStreamEvent
  text: string
  sessionId: string | null
  setSelectedSessionId: (id: string) => void
  setMessages: React.Dispatch<React.SetStateAction<UIChatMessage[]>>
  utils: ReturnType<typeof trpc.useUtils>
  setSessionSheetOpen: (value: boolean) => void
  onNewSessionCreated?: (sessionId: string) => void
}

/**
 * 处理流式事件
 * @param param0
 * @returns
 */
export function processStreamEvent({
  event,
  text,
  sessionId,
  setSelectedSessionId,
  setMessages,
  utils,
  setSessionSheetOpen,
  onNewSessionCreated,
}: ProcessStreamEventArgs) {
  switch (event.type) {
    case 'session':
      setSelectedSessionId(event.sessionId)
      setSessionSheetOpen(false)
      utils.aichat.listSessions.invalidate()
      if (!sessionId && onNewSessionCreated) {
        onNewSessionCreated(event.sessionId)
      }
      return event.sessionId
    case 'user-message':
      setMessages(prev => {
        if (prev.some(message => message.id === event.messageId)) {
          return prev
        }
        const createdAt = new Date()
        return [
          ...prev,
          {
            id: event.messageId,
            role: 'user',
            text,
            status: 'completed',
            createdAt,
          },
        ]
      })
      return sessionId
    case 'assistant-start':
      setMessages(prev => {
        if (prev.some(message => message.id === event.messageId)) {
          return prev
        }
        const createdAt = new Date()
        return [
          ...prev,
          {
            id: event.messageId,
            role: 'assistant',
            text: '',
            status: 'streaming',
            createdAt,
          },
        ]
      })
      return sessionId
    case 'assistant-delta':
      setMessages(prev =>
        prev.map(message =>
          message.id === event.messageId
            ? {
                ...message,
                text: `${message.text}${event.delta}`,
              }
            : message
        )
      )
      return sessionId
    case 'assistant-end':
      setMessages(prev =>
        prev.map(message =>
          message.id === event.messageId
            ? {
                ...message,
                text: event.text,
                status: 'completed',
              }
            : message
        )
      )
      utils.aichat.listSessions.invalidate()
      if (sessionId) {
        utils.aichat.getSessionMessages.invalidate({ sessionId })
      }
      return sessionId
    case 'error':
      toast.error(event.message)
      return sessionId
    default:
      return sessionId
  }
}
