'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import {
  CheckCircleIcon,
  FileTextIcon,
  PaperclipIcon,
  RefreshCwIcon,
  Trash2Icon,
  UploadIcon,
  XCircleIcon,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import { Response } from '@/components/ai-elements/response'
import { PDFViewerClient } from '@/components/pdf/pdf-viewer-client'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

interface UploadedFile {
  name: string
  size: number
  uploadTime: Date
  url: string
  pageCount?: number
}

async function convertFilesToDataURLs(
  files: FileList
): Promise<
  { type: 'file'; filename: string; mediaType: string; url: string }[]
> {
  return Promise.all(
    Array.from(files).map(file => {
      return new Promise<{
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
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    })
  )
}

export default function EnhancedChatWithPDFPage() {
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [sessionId] = useState(
    () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  )
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingStatus, setProcessingStatus] = useState<string>('')
  const [retryCount, setRetryCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Custom transport with sessionId
  const customTransport = new DefaultChatTransport({
    api: '/api/ai/guides/chat-with-pdf',
    fetch: async (url, options) => {
      const body = JSON.parse((options?.body as string) || '{}')
      const enhancedBody = {
        ...body,
        sessionId,
      }

      return fetch(url, {
        ...options,
        body: JSON.stringify(enhancedBody),
      })
    },
  })

  const { messages, sendMessage, status } = useChat({
    transport: customTransport,
  })

  // Monitor useChat status changes
  useEffect(() => {
    if (status === 'ready' && isProcessing) {
      setIsProcessing(false)
      setProcessingStatus('')
      setRetryCount(0)
    } else if (status === 'error') {
      setIsProcessing(false)
      setProcessingStatus('')
      setRetryCount(prev => prev + 1)

      if (retryCount < 2) {
        setError(`请求失败，正在自动重试... (${retryCount + 1}/3)`)
        setTimeout(() => {
          setError(null)
        }, 2000)
      } else {
        setError('多次重试后仍然失败，请检查网络连接或稍后再试')
      }
    }
  }, [status, isProcessing, retryCount])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files)
      const pdfFiles = selectedFiles.filter(
        file => file.type === 'application/pdf'
      )

      if (pdfFiles.length !== selectedFiles.length) {
        toast.warning('只支持 PDF 文件，其他格式的文件已被过滤')
      }

      if (pdfFiles.length === 0) {
        toast.error('请选择 PDF 文件')
        return
      }

      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024
      const oversizedFiles = pdfFiles.filter(file => file.size > maxSize)

      if (oversizedFiles.length > 0) {
        toast.error(
          `文件过大: ${oversizedFiles.map(f => f.name).join(', ')}。单个文件大小不能超过 10MB。`
        )
        return
      }

      const fileList = new DataTransfer()
      for (const file of pdfFiles) {
        fileList.items.add(file)
      }
      setFiles(fileList.files)
      setError(null)
    }
  }

  // const clearFiles = () => {
  //   setFiles(null)
  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = ''
  //   }
  // }

  const clearSession = async () => {
    try {
      await fetch('/api/ai/guides/chat-with-pdf', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      setUploadedFiles([])
      setSelectedFile(null)
      toast.success('会话已清理')
    } catch (error) {
      console.error('清理会话失败:', error)
      toast.error('清理会话失败')
    }
  }

  // const formatFileSize = (bytes: number): string => {
  //   if (bytes === 0) return '0 Bytes'
  //   const k = 1024
  //   const sizes = ['Bytes', 'KB', 'MB', 'GB']
  //   const i = Math.floor(Math.log(bytes) / Math.log(k))
  //   return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  // }

  const onPDFLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      // Update the selected file with page count
      if (selectedFile) {
        setSelectedFile(prev =>
          prev ? { ...prev, pageCount: numPages } : null
        )
        setUploadedFiles(prev =>
          prev.map(file =>
            file.name === selectedFile.name
              ? { ...file, pageCount: numPages }
              : file
          )
        )
      }
    },
    [selectedFile]
  )

  const onPDFLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error)
    toast.error('PDF 加载失败，请检查文件格式')
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileTextIcon className="h-6 w-6 text-primary" />
              PDF 智能分析对话
            </h1>
            <p className="text-muted-foreground text-sm">
              上传 PDF 文档，与 AI 进行智能对话分析
            </p>
          </div>

          <div className="flex items-center gap-2">
            {uploadedFiles.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                已上传 {uploadedFiles.length} 个文档
              </div>
            )}
            {uploadedFiles.length > 0 && (
              <Button onClick={clearSession} variant="outline" size="sm">
                <Trash2Icon className="h-4 w-4 mr-1" />
                清理会话
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4">
          <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircleIcon className="h-4 w-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive flex-1">{error}</p>
              <Button
                onClick={() => setError(null)}
                className="text-destructive/70 hover:text-destructive flex-shrink-0"
              >
                <XCircleIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* PDF Viewer Panel */}
          <ResizablePanel defaultSize={45} minSize={30} maxSize={70}>
            <div className="h-full border-r">
              {selectedFile ? (
                <div className="h-full flex flex-col">
                  {/* PDF Info Header */}
                  <div className="border-b p-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileTextIcon className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {selectedFile.name}
                        </span>
                        {selectedFile.pageCount && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            ({selectedFile.pageCount} 页)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PDF Viewer */}
                  <div className="flex-1 overflow-hidden">
                    <PDFViewerClient
                      file={selectedFile.url}
                      onLoadSuccess={onPDFLoadSuccess}
                      onLoadError={onPDFLoadError}
                      className="h-full"
                    />
                  </div>
                </div>
              ) : (
                /* File Upload Area */
                <div className="h-full flex flex-col items-center justify-center p-8 bg-muted/20">
                  <div className="text-center max-w-sm">
                    <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileTextIcon className="h-10 w-10 text-primary" />
                    </div>

                    <h3 className="text-lg font-semibold mb-2">
                      上传 PDF 文档
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      选择 PDF 文件开始与 AI 的智能对话
                    </p>

                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,application/pdf"
                      multiple
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                      className="mb-4"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                          处理中...
                        </>
                      ) : (
                        <>
                          <UploadIcon className="h-4 w-4 mr-2" />
                          选择 PDF 文件
                        </>
                      )}
                    </Button>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• 支持 PDF 格式文件</p>
                      <p>• 单个文件最大 10MB</p>
                      <p>• 可同时上传多个文件</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Chat Panel */}
          <ResizablePanel defaultSize={55} minSize={30}>
            <div className="h-full flex flex-col">
              {/* Chat Content */}
              <div className="flex-1 overflow-hidden">
                <Conversation className="h-full">
                  <ConversationContent className="p-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-md">
                          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                            <FileTextIcon className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold mb-3">
                            开始智能对话
                          </h3>
                          <p className="text-muted-foreground text-sm mb-6">
                            {uploadedFiles.length > 0
                              ? '选择一个 PDF 文档开始对话，或直接询问问题'
                              : '上传 PDF 文档后，您可以询问关于文档内容的任何问题'}
                          </p>

                          {uploadedFiles.length === 0 && (
                            <div className="space-y-2 text-xs text-muted-foreground bg-muted/30 p-4 rounded-lg">
                              <p className="font-medium mb-2">示例问题：</p>
                              <p>📄 "这个文档的主要内容是什么？"</p>
                              <p>📋 "总结文档中的关键点"</p>
                              <p>🔍 "解释第三章的内容"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      messages.map(message => (
                        <Message key={message.id} from={message.role}>
                          <MessageContent>
                            {message.parts?.map((part, partIndex) => {
                              if (part.type === 'text') {
                                return (
                                  <Response
                                    key={`${message.id}-part-${partIndex}`}
                                  >
                                    {part.text}
                                  </Response>
                                )
                              }
                              if (part.type === 'file') {
                                return (
                                  <div
                                    key={`${message.id}-file-${partIndex}`}
                                    className="mt-2"
                                  >
                                    <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <PaperclipIcon className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">
                                          {part.filename}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          已上传成功
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            })}
                          </MessageContent>
                        </Message>
                      ))
                    )}

                    {/* Loading State */}
                    {(status === 'submitted' ||
                      status === 'streaming' ||
                      isProcessing) && (
                      <Message from="assistant">
                        <MessageContent>
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                            <span>
                              {processingStatus ||
                                (isProcessing
                                  ? '正在处理请求...'
                                  : status === 'streaming'
                                    ? '正在生成回复...'
                                    : '正在发送消息...')}
                            </span>
                          </div>
                          {(isProcessing || processingStatus) && (
                            <div className="mt-2 space-y-1">
                              <div className="text-xs text-muted-foreground">
                                {files &&
                                files.length > 0 &&
                                !uploadedFiles.length
                                  ? `正在处理 ${files.length} 个 PDF 文件，请耐心等待`
                                  : '正在与 AI 通信，请稍候'}
                              </div>
                              <div className="h-1 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full animate-pulse w-1/3" />
                              </div>
                            </div>
                          )}
                        </MessageContent>
                      </Message>
                    )}
                  </ConversationContent>
                </Conversation>
              </div>

              {/* Chat Input Area */}
              <div className="border-t bg-background/95 backdrop-blur-sm">
                <div className="p-4">
                  {/* File Selection */}
                  {uploadedFiles.length > 0 && (
                    <div className="mb-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          已上传的文档
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {uploadedFiles.length} 个文件
                        </span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {uploadedFiles.map((file, index) => (
                          <Button
                            key={index}
                            onClick={() => setSelectedFile(file)}
                            variant={
                              selectedFile?.name === file.name
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            className="flex-shrink-0 h-8"
                          >
                            <FileTextIcon className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-[100px] text-xs">
                              {file.name.replace('.pdf', '')}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prompt Input */}
                  <PromptInput
                    onSubmit={async message => {
                      if (
                        (!message.text?.trim() &&
                          (!files || files.length === 0)) ||
                        status !== 'ready'
                      )
                        return

                      setIsProcessing(true)
                      setError(null)
                      setProcessingStatus('正在处理文件...')

                      try {
                        let fileParts: {
                          type: 'file'
                          filename: string
                          mediaType: string
                          url: string
                        }[] = []

                        // Process file uploads
                        if (files && files.length > 0) {
                          setProcessingStatus('正在处理文件...')

                          try {
                            fileParts = await convertFilesToDataURLs(files)
                          } catch (fileError) {
                            console.error('文件处理失败:', fileError)
                            throw new Error(
                              '文件处理失败，请检查文件格式是否正确'
                            )
                          }

                          // Record uploaded files and auto-select first one
                          setProcessingStatus('正在准备上传...')
                          const newFiles = Array.from(files).map(
                            (file, index) => ({
                              name: file.name,
                              size: file.size,
                              uploadTime: new Date(),
                              url: fileParts[index]?.url || '',
                            })
                          )

                          setUploadedFiles(prev => [...prev, ...newFiles])

                          // Auto-select the first uploaded file
                          if (newFiles.length > 0 && !selectedFile) {
                            setSelectedFile(newFiles[0] || null)
                          }

                          toast.success(`成功处理 ${fileParts.length} 个文件`)
                        }

                        // Validate message content
                        const messageText =
                          message.text?.trim() ||
                          (fileParts.length > 0 ? '请分析上传的文档内容' : '')
                        if (!messageText && fileParts.length === 0) {
                          throw new Error('请输入消息内容或上传文件')
                        }

                        setProcessingStatus('正在发送消息...')

                        // Send message using useChat hook
                        sendMessage({
                          role: 'user',
                          parts: [
                            {
                              type: 'text',
                              text: messageText,
                            },
                            ...fileParts,
                          ],
                        })

                        // Clear file-related state
                        if (files && files.length > 0) {
                          setFiles(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                        }

                        setInput('')
                        setError(null)
                      } catch (error) {
                        console.error('处理失败:', error)
                        let errorMessage = '处理失败，请重试'

                        if (error instanceof Error) {
                          errorMessage = error.message
                        } else if (typeof error === 'string') {
                          errorMessage = error
                        }

                        // Check for network errors
                        if (
                          errorMessage.includes('Failed to fetch') ||
                          errorMessage.includes('Network')
                        ) {
                          errorMessage = '网络连接失败，请检查网络连接后重试'
                        } else if (errorMessage.includes('timeout')) {
                          errorMessage =
                            '请求超时，文件可能过大，请尝试较小的文件'
                        }

                        setError(errorMessage)
                        toast.error(errorMessage)
                        setRetryCount(prev => prev + 1)
                      } finally {
                        setIsProcessing(false)
                        setProcessingStatus('')
                      }
                    }}
                    className="w-full"
                  >
                    <PromptInputBody>
                      <PromptInputTextarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={
                          uploadedFiles.length > 0
                            ? '询问关于已上传文档的问题...'
                            : '询问关于文档的问题，或者直接上传文件让 AI 分析...'
                        }
                        disabled={status !== 'ready' || isProcessing}
                        className="min-h-[60px] resize-none"
                      />
                      <PromptInputSubmit
                        disabled={
                          (!input.trim() && (!files || files.length === 0)) ||
                          status !== 'ready' ||
                          isProcessing
                        }
                        status={isProcessing ? 'streaming' : status}
                      />
                    </PromptInputBody>
                  </PromptInput>

                  {/* Quick Questions */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {[
                        '总结文档的主要内容',
                        '这个文档说了什么？',
                        '文档中的关键结论是什么？',
                        '解释一下核心观点',
                      ].map((question, index) => (
                        <Button
                          key={index}
                          onClick={() => setInput(question)}
                          variant="ghost"
                          size="sm"
                          disabled={status !== 'ready' || isProcessing}
                          className="text-xs h-7 text-muted-foreground hover:text-foreground"
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
