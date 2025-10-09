'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ImageIcon, LinkIcon, ZapIcon } from 'lucide-react'
import Image from 'next/image'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export default function StreamImagePage() {
  const [input, setInput] = useState('')
  const [imageUrl, setImageUrl] = useState(
    'https://science.nasa.gov/wp-content/uploads/2023/09/web-first-images-release.png'
  )

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/guides/stream-image',
    }),
  })

  const suggestedPrompts = [
    '描述这张图片中的主要内容',
    '这张图片的艺术风格是什么？',
    '图片中有哪些色彩和构图特点？',
    '这张图片传达了什么情感或氛围？',
  ]

  const sampleImages = [
    {
      url: 'https://science.nasa.gov/wp-content/uploads/2023/09/web-first-images-release.png',
      title: 'NASA 韦伯望远镜深空图像',
    },
    {
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      title: '山景风光',
    },
    {
      url: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=400',
      title: '城市建筑',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <ZapIcon className="h-6 w-6" />
            图像流式分析示例
          </CardTitle>
          <p className="text-muted-foreground">
            上传图像 URL 并与 AI 进行关于图像内容的实时流式对话
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">功能特点：</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 支持多模态输入（图像 + 文本）</li>
              <li>• 实时流式图像分析</li>
              <li>• 智能图像理解和描述</li>
              <li>• 连续对话支持</li>
            </ul>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              🌟 AI 可以分析图像的构图、色彩、主题和风格等多个维度
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-4">
          <Conversation>
            <ConversationContent>
              {messages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">开始图像分析对话</p>
                  <p className="text-sm">
                    输入图像 URL 和问题，AI 将实时分析图像内容
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
                          case 'file':
                            return (
                              <div
                                key={`${message.id}-file-${partIndex}`}
                                className="my-4"
                              >
                                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                                  <div className="mb-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <ImageIcon className="h-4 w-4 text-green-600" />
                                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                        分析图像
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex justify-center">
                                    <Image
                                      src={part.url}
                                      alt={part.filename ?? '用户上传的图像'}
                                      width={400}
                                      height={300}
                                      className="rounded-lg shadow-lg max-w-full h-auto"
                                    />
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
                      <span>正在分析图像内容...</span>
                    </div>
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
          </Conversation>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="image-url"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <LinkIcon className="h-4 w-4" />
                      图像 URL
                    </Label>
                    <Input
                      id="image-url"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="输入图像的 URL 地址..."
                      className="mt-1"
                    />
                  </div>

                  {imageUrl && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">
                        预览图像：
                      </p>
                      <div className="flex justify-center">
                        <Image
                          src={imageUrl}
                          alt="预览图像"
                          width={200}
                          height={150}
                          className="rounded-lg shadow-sm max-w-full h-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <PromptInput
              onSubmit={message => {
                if (
                  !(message.text?.trim() || imageUrl.trim()) ||
                  status !== 'ready'
                )
                  return

                sendMessage({
                  role: 'user',
                  parts: [
                    // 条件性添加图像部分
                    ...(imageUrl.trim().length > 0
                      ? [
                          {
                            type: 'file' as const,
                            mediaType: 'image/png',
                            url: imageUrl,
                          },
                        ]
                      : []),
                    // 文本部分
                    {
                      type: 'text',
                      text: message.text || '请描述这张图片的内容',
                    },
                  ],
                })
                setInput('')
              }}
            >
              <PromptInputBody>
                <PromptInputTextarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="询问关于图像的问题..."
                  disabled={status !== 'ready'}
                  className="min-h-[60px]"
                />
                <PromptInputSubmit
                  disabled={
                    !(input.trim() || imageUrl.trim()) || status !== 'ready'
                  }
                  status={status}
                />
              </PromptInputBody>
            </PromptInput>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">快速提问</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                点击下面的问题快速开始：
              </p>
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(prompt)}
                  disabled={status !== 'ready'}
                  className="w-full text-left justify-start h-auto py-2 px-3 whitespace-normal"
                >
                  {prompt}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">示例图像</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                点击使用示例图像：
              </p>
              {sampleImages.map((image, index) => (
                <div key={index} className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImageUrl(image.url)}
                    disabled={status !== 'ready'}
                    className="w-full"
                  >
                    {image.title}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
