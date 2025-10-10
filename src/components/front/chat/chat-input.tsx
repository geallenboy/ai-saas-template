'use client'

import { GlobeIcon, MicIcon } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'

const models = [
  {
    name: 'GPT-4o',
    value: 'gpt-4o',
  },
  {
    name: 'GPT-4',
    value: 'gpt-4',
  },
  {
    name: 'Claude 3 Opus',
    value: 'claude-3-opus',
  },
]

interface ChatInputProps {
  onSubmit: (message: PromptInputMessage) => void
  isStreaming: boolean
  selectedModel: string
  onModelChange: (model: string) => void
  webSearchEnabled: boolean
  onWebSearchToggle: () => void
  isNewChat?: boolean
}

export function ChatInput({
  onSubmit,
  isStreaming,
  selectedModel,
  onModelChange,
  webSearchEnabled,
  onWebSearchToggle,
  isNewChat = false,
}: ChatInputProps) {
  const promptInputRef = useRef<HTMLDivElement>(null)

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      // 检查是否有内容或附件
      const hasText = Boolean(message.text?.trim())
      const hasAttachments = Boolean(message.files?.length)

      if (!(hasText || hasAttachments)) {
        return
      }

      onSubmit(message)

      // 发送消息后清空输入框
      setTimeout(() => {
        const textarea = promptInputRef.current?.querySelector('textarea')
        if (textarea) {
          textarea.value = ''
          textarea.focus()
        }
      }, 0)
    },
    [onSubmit]
  )

  // 处理键盘快捷键 (Ctrl/Cmd + Enter 发送)
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      const textarea = promptInputRef.current?.querySelector(
        'textarea'
      ) as HTMLTextAreaElement
      if (textarea?.value.trim()) {
        event.preventDefault()
        const submitButton = promptInputRef.current?.querySelector(
          'button[type="submit"]'
        ) as HTMLButtonElement
        submitButton?.click()
      }
    }
  }, [])

  useEffect(() => {
    const textarea = promptInputRef.current?.querySelector('textarea')
    if (textarea) {
      textarea.addEventListener('keydown', handleKeyDown)
      return () => textarea.removeEventListener('keydown', handleKeyDown)
    }
    return undefined
  }, [handleKeyDown])
  // Auto-focus textarea for new chat
  useEffect(() => {
    if (isNewChat && !isStreaming) {
      const textarea = promptInputRef.current?.querySelector('textarea')
      if (textarea) {
        setTimeout(() => {
          textarea.focus()
        }, 100)
      }
    }
  }, [isNewChat, isStreaming])
  return (
    <div className="pl-4 pr-4 pb-4 mx-auto w-full">
      <div ref={promptInputRef}>
        <PromptInput onSubmit={handleSubmit} globalDrop multiple>
          <PromptInputBody>
            <PromptInputAttachments>
              {attachment => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              placeholder={
                isStreaming
                  ? 'AI 正在回复中...'
                  : '发消息或者输入 / 选择技能 (Ctrl+Enter 发送)'
              }
              disabled={isStreaming}
            />
          </PromptInputBody>
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton variant="outline" disabled={isStreaming}>
                <MicIcon size={16} />
                <span className="sr-only">Microphone</span>
              </PromptInputButton>
              <PromptInputButton
                variant={webSearchEnabled ? 'default' : 'outline'}
                onClick={onWebSearchToggle}
                disabled={isStreaming}
              >
                <GlobeIcon size={16} />
                <span className="ml-2">联网搜索</span>
              </PromptInputButton>
              <PromptInputModelSelect
                onValueChange={onModelChange}
                value={selectedModel}
                disabled={isStreaming}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map(model => (
                    <PromptInputModelSelectItem
                      key={model.value}
                      value={model.value}
                    >
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={isStreaming}
              status={isStreaming ? 'streaming' : undefined}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  )
}
