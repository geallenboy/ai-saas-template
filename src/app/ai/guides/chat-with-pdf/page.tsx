'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import {
  FileTextIcon,
  Loader2Icon,
  PaperclipIcon,
  Trash2Icon,
  UploadIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
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

async function convertFilesToDataURLs(
  files: File[]
): Promise<
  { type: 'file'; filename: string; mediaType: string; url: string }[]
> {
  return Promise.all(
    files.map(
      file =>
        new Promise<{
          type: 'file'
          filename: string
          mediaType: string
          url: string
        }>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve({
              type: 'file',
              filename: file.name,
              mediaType: file.type,
              url: reader.result as string,
            })
          }
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(file)
        })
    )
  )
}

interface PendingFile {
  name: string
  size: number
}

export default function ChatWithPDFPage() {
  const [input, setInput] = useState('')
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const customTransport = new DefaultChatTransport({
    api: '/api/ai/guides/chat-with-pdf',
  })

  const { messages, sendMessage, status } = useChat({
    transport: customTransport,
    onError: error => {
      toast.error(`聊天出错: ${error.message}`)
    },
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      setSelectedFiles([])
      setPendingFiles([])
      return
    }

    const files = Array.from(event.target.files)
    const pdfFiles = files.filter(file => file.type === 'application/pdf')

    if (pdfFiles.length !== files.length) {
      toast.warning('只支持 PDF 文件，其他格式已被自动过滤。')
    }

    const maxSize = 10 * 1024 * 1024
    const oversizedFiles = pdfFiles.filter(file => file.size > maxSize)

    if (oversizedFiles.length > 0) {
      toast.error(
        `文件过大: ${oversizedFiles.map(f => f.name).join(', ')}。单个文件大小不能超过 10MB。`
      )
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setSelectedFiles(pdfFiles)
    setPendingFiles(
      pdfFiles.map(file => ({
        name: file.name,
        size: file.size,
      }))
    )
  }

  const resetAll = () => {
    setSelectedFiles([])
    setPendingFiles([])
    setInput('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    toast.success('会话已重置')
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  const isSubmitting = status === 'submitted' || status === 'streaming'
  const isChatDisabled =
    isSubmitting || (!input.trim() && pendingFiles.length === 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <FileTextIcon className="h-6 w-6" />
            与您的 PDF 对话
          </CardTitle>
          <p className="text-muted-foreground">
            选择 PDF 并直接发送给 AI，模型会读取文档内容并回答问题。
          </p>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <UploadIcon className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">选择要发送的 PDF 文档</h3>
                  <p className="text-sm text-muted-foreground">
                    上传文件后即可向 AI 提问，无需额外步骤
                  </p>
                </div>

                <div className="flex items-center gap-4 justify-center">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    variant="outline"
                  >
                    <PaperclipIcon className="h-4 w-4 mr-2" />
                    选择 PDF 文件
                  </Button>
                  {pendingFiles.length > 0 && (
                    <Button
                      onClick={resetAll}
                      variant="destructive"
                      size="sm"
                      disabled={isSubmitting}
                    >
                      <Trash2Icon className="h-4 w-4 mr-2" />
                      清空已选择
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• 支持 PDF 格式文件</p>
                  <p>• 单个文件最大 10MB</p>
                  <p>• 最多可同时发送多个文档</p>
                </div>
              </div>
            </div>

            {pendingFiles.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">已选择文件:</h4>
                <div className="space-y-2">
                  {pendingFiles.map(file => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <div className="flex items-center gap-2">
                        <FileTextIcon className="h-4 w-4" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Conversation>
              <ConversationContent>
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileTextIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <div>
                      <p className="text-lg mb-2">欢迎使用 PDF 聊天助手</p>
                      <p>上传一个或多个 PDF，然后提出你的问题。</p>
                    </div>
                  </div>
                ) : (
                  messages.map(message => (
                    <Message key={message.id} from={message.role}>
                      <MessageContent>
                        {message.parts?.map((part, partIndex) => {
                          if (part.type === 'text') {
                            return (
                              <div
                                key={`${message.id}-text-${partIndex}`}
                                className="whitespace-pre-wrap"
                              >
                                {part.text}
                              </div>
                            )
                          }
                          if (part.type === 'file') {
                            return (
                              <div
                                key={`${message.id}-file-${partIndex}`}
                                className="mt-2 text-xs text-muted-foreground"
                              >
                                📄 {part.filename}
                              </div>
                            )
                          }
                          return null
                        })}
                      </MessageContent>
                    </Message>
                  ))
                )}

                {isSubmitting && (
                  <Message from="assistant">
                    <MessageContent>
                      <div className="flex items-center space-x-2">
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          正在读取文档内容并生成回复...
                        </span>
                      </div>
                    </MessageContent>
                  </Message>
                )}
              </ConversationContent>
            </Conversation>

            <PromptInput
              onSubmit={async message => {
                if (isSubmitting) return

                const textValue = message.text?.trim() ?? ''
                if (!textValue && selectedFiles.length === 0) {
                  toast.warning('请输入问题或选择至少一个 PDF 文件。')
                  return
                }

                try {
                  const fileParts =
                    selectedFiles.length > 0
                      ? await convertFilesToDataURLs(selectedFiles)
                      : []

                  await sendMessage({
                    role: 'user',
                    parts: [
                      ...(textValue
                        ? [{ type: 'text' as const, text: textValue }]
                        : []),
                      ...fileParts,
                    ],
                  })

                  setInput('')
                  setSelectedFiles([])
                  setPendingFiles([])
                  if (fileInputRef.current) fileInputRef.current.value = ''
                } catch (error) {
                  const errorMessage =
                    error instanceof Error
                      ? error.message
                      : '发送消息时出现错误'
                  toast.error(errorMessage)
                }
              }}
            >
              <PromptInputBody>
                <PromptInputTextarea
                  value={input}
                  onChange={event => setInput(event.target.value)}
                  placeholder="请输入您关于文档的问题..."
                  disabled={isSubmitting}
                  className="min-h-[80px]"
                />
                <PromptInputSubmit disabled={isChatDisabled} status={status} />
              </PromptInputBody>
            </PromptInput>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">快捷问题:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  '请总结这些文档的主要内容',
                  '文档中有哪些重要结论？',
                  '请提取关键信息和数据',
                  '这些文档讨论了什么主题？',
                ].map(question => (
                  <Button
                    key={question}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setInput(question)}
                    disabled={isSubmitting}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
