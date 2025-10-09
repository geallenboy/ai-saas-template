'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { clsx } from 'clsx'
import { ImageIcon, SparklesIcon } from 'lucide-react'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { ChatTools } from '@/app/api/ai/guides/generate-image/route'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const styleOptions = [
  {
    id: 'photorealistic',
    label: '写实摄影',
    helper: '高清摄影、真实光影',
    promptSuffix:
      'Shot as an ultra-realistic photograph with cinematic lighting and rich details.',
  },
  {
    id: 'digital-art',
    label: '数字艺术',
    helper: '插画、概念艺术',
    promptSuffix:
      'Rendered as vibrant digital art with smooth gradients and crisp outlines.',
  },
  {
    id: 'watercolor',
    label: '水彩风',
    helper: '柔和、手绘质感',
    promptSuffix:
      'Painted in soft watercolor style with gentle brush strokes and pastel colors.',
  },
  {
    id: 'low-poly',
    label: '低多边形',
    helper: '几何、简洁结构',
    promptSuffix:
      'Designed in stylized low-poly aesthetic with clean geometric shapes.',
  },
]

const ratioOptions = [
  { id: '1:1', label: '1 : 1', promptSuffix: 'Square aspect ratio 1:1.' },
  {
    id: '3:4',
    label: '3 : 4',
    promptSuffix: 'Vertical illustration aspect ratio 3:4.',
  },
  {
    id: '16:9',
    label: '16 : 9',
    promptSuffix: 'Wide cinematic aspect ratio 16:9.',
  },
]

const discoveryPrompts = [
  '霓虹灯照耀的赛博朋克街道，雨夜反射光影',
  '穿着宇航服的柴犬在月球上插旗，电影感',
  '日出时分的热带海滩，粉色天空和细腻海浪',
  '以莫奈风格绘制的现代城市公园',
]

function buildPrompt(base: string, style?: string, ratio?: string) {
  const parts = [base.trim()]
  if (style) parts.push(style)
  if (ratio) parts.push(ratio)
  return parts.filter(Boolean).join(' ')
}

function toFileName(prompt: string) {
  const normalized = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
  return `${normalized || 'ai-image'}.png`
}

function downloadBase64Image(dataUrl: string, filename: string) {
  const anchor = document.createElement('a')
  anchor.href = dataUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('提示词已复制')
  } catch (error) {
    console.error(error)
    toast.error('复制失败，请手动复制')
  }
}

type ChatMessage = UIMessage<never, never, ChatTools>

export default function GenerateImagePage() {
  const [input, setInput] = useState('')
  const [selectedStyle, setSelectedStyle] = useState(styleOptions[0]?.id ?? '')
  const [selectedRatio, setSelectedRatio] = useState(ratioOptions[0]?.id ?? '')
  const { messages, sendMessage, status } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: '/api/ai/guides/generate-image',
    }),
    onError: error => {
      toast.error(`生成失败: ${error.message}`)
    },
  })

  const suggestedPrompts = [
    '一只可爱的橙色小猫在花园里玩耍',
    '未来主义风格的城市天际线，夜晚霓虹灯闪烁',
    '宁静的山湖，倒映着雪山和松树',
    '抽象风格的彩色几何图形组合',
  ]

  const selectedStyleOption = useMemo(
    () => styleOptions.find(style => style.id === selectedStyle),
    [selectedStyle]
  )
  const selectedRatioOption = useMemo(
    () => ratioOptions.find(ratio => ratio.id === selectedRatio),
    [selectedRatio]
  )

  const promptPreview = useMemo(() => {
    return buildPrompt(
      input,
      selectedStyleOption?.promptSuffix,
      selectedRatioOption?.promptSuffix
    )
  }, [
    input,
    selectedRatioOption?.promptSuffix,
    selectedStyleOption?.promptSuffix,
  ])

  const isGenerating = status === 'submitted' || status === 'streaming'

  const handleSubmit = async (message: { text?: string }) => {
    if (isGenerating) return
    const textValue = message.text?.trim() ?? ''
    if (!textValue) {
      toast.warning('请输入图像描述')
      return
    }

    const finalPrompt = buildPrompt(
      textValue,
      selectedStyleOption?.promptSuffix,
      selectedRatioOption?.promptSuffix
    )

    try {
      await sendMessage({
        parts: [{ type: 'text', text: finalPrompt }],
      })
      setInput('')
    } catch (error) {
      console.error(error)
      toast.error('发送生成请求失败，请重试')
    }
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-[-280px] h-[420px] bg-gradient-to-br from-purple-400/30 via-sky-300/20 to-pink-400/30 blur-3xl dark:from-purple-900/40 dark:via-sky-900/30 dark:to-pink-900/40" />
      </div>

      <div className="container mx-auto max-w-6xl px-5 pb-16 pt-10 lg:pt-16">
        <header className="mb-10 rounded-3xl border border-border/60 bg-background/60 p-8 shadow-xl backdrop-blur-2xl lg:p-12">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge
                  variant="outline"
                  className="border-primary/40 text-primary"
                >
                  全新体验
                </Badge>
                <span>通过更细腻的控制生成高质量图像</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                AI 图像工作室
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                组合提示词、艺术风格与画面比例，实时打造专属于您的视觉作品。生成后支持一键下载、复制提示词或新窗口预览。
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-primary">
              <ImageIcon className="h-8 w-8" />
              <div>
                <p className="font-medium">最新模型驱动</p>
                <p className="text-xs text-primary/80">
                  GPT-4o 生成 · 支持多风格融合
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <Card className="overflow-hidden border-border/70 bg-background/70 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/60 bg-muted/40 py-5">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold">
                  创作记录
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  查看历史对话与生成结果，支持实时预览与操作。
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {status === 'ready' ? '就绪' : '生成中'}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[540px]">
                <Conversation>
                  <ConversationContent className="px-6 py-6">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 py-16 text-center text-muted-foreground">
                        <SparklesIcon className="h-12 w-12 opacity-60" />
                        <h3 className="mt-6 text-lg font-medium text-foreground">
                          还没有生成记录
                        </h3>
                        <p className="mt-2 max-w-sm text-sm">
                          输入图片描述并选择右侧的风格与比例，开始创作您的第一张
                          AI 图像。
                        </p>
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
                                    className="rounded-xl border border-border/60 bg-background/80 p-4 text-sm leading-relaxed text-foreground shadow-sm"
                                  >
                                    {part.text}
                                  </div>
                                )
                              }
                              if (part.type === 'tool-generateImage') {
                                const { state } = part

                                if (state === 'input-available') {
                                  return (
                                    <div
                                      key={`${message.id}-loader-${partIndex}`}
                                      className="my-3 flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary"
                                    >
                                      <span className="flex h-3 w-3 animate-ping rounded-full bg-primary" />
                                      正在生成图像，请稍候…
                                    </div>
                                  )
                                }
                                if (state === 'output-available') {
                                  const { input, output } = part
                                  const imageSrc = `data:image/png;base64,${output.image}`
                                  const filename = toFileName(input.prompt)
                                  return (
                                    <div
                                      key={`${message.id}-image-${partIndex}`}
                                      className="my-3 space-y-4 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm"
                                    >
                                      <div className="space-y-2">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                          提示词
                                        </p>
                                        <p className="rounded-lg bg-muted/50 p-3 text-sm leading-relaxed text-foreground">
                                          {input.prompt}
                                        </p>
                                      </div>
                                      <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
                                        <Image
                                          src={imageSrc}
                                          alt={input.prompt}
                                          width={960}
                                          height={960}
                                          className="h-auto w-full object-cover"
                                        />
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        <Button
                                          size="sm"
                                          variant="default"
                                          onClick={() => {
                                            try {
                                              downloadBase64Image(
                                                imageSrc,
                                                filename
                                              )
                                            } catch (error) {
                                              console.error(error)
                                              toast.error(
                                                '下载失败，请稍后重试'
                                              )
                                            }
                                          }}
                                        >
                                          保存图像
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          onClick={() => {
                                            void copyToClipboard(input.prompt)
                                          }}
                                        >
                                          复制提示词
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            window.open(
                                              imageSrc,
                                              '_blank',
                                              'noopener'
                                            )
                                          }}
                                        >
                                          新窗口预览
                                        </Button>
                                      </div>
                                    </div>
                                  )
                                }
                              }
                              return null
                            })}
                          </MessageContent>
                        </Message>
                      ))
                    )}
                  </ConversationContent>
                </Conversation>
              </ScrollArea>

              <div className="border-t border-border/60 bg-muted/40 px-6 py-5">
                <PromptInput
                  onSubmit={async message => {
                    await handleSubmit(message)
                  }}
                >
                  <PromptInputBody>
                    <PromptInputTextarea
                      value={input}
                      onChange={event => setInput(event.target.value)}
                      placeholder="描述您想要生成的图像，包括风格、主题、颜色等细节…"
                      disabled={isGenerating}
                      className="min-h-[90px] rounded-2xl border border-border/60 bg-background/80"
                    />
                    <PromptInputSubmit
                      disabled={!input.trim() || isGenerating}
                      status={status}
                    />
                  </PromptInputBody>
                  {promptPreview && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        最终提示词
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="line-clamp-1 flex-1 text-left">
                        {promptPreview}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          void copyToClipboard(promptPreview)
                        }}
                      >
                        复制
                      </Button>
                    </div>
                  )}
                </PromptInput>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/70 bg-background/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  创作控件
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  选择艺术风格与画面比例，实时调整生成效果。
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <section className="space-y-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    艺术风格
                  </p>
                  <div className="grid gap-2">
                    {styleOptions.map(option => (
                      <Button
                        key={option.id}
                        type="button"
                        variant={
                          selectedStyle === option.id ? 'default' : 'outline'
                        }
                        size="sm"
                        className={clsx(
                          'h-auto justify-start rounded-xl border border-border/60 py-3 px-3 text-left shadow-sm transition-all',
                          selectedStyle === option.id
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-background/80 hover:bg-muted'
                        )}
                        disabled={isGenerating}
                        onClick={() => setSelectedStyle(option.id)}
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-sm font-medium">
                            {option.label}
                          </span>
                          <span className="text-xs text-muted-foreground/80">
                            {option.helper}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </section>

                <Separator />

                <section className="space-y-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    画面比例
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {ratioOptions.map(option => (
                      <Button
                        key={option.id}
                        type="button"
                        variant={
                          selectedRatio === option.id ? 'default' : 'outline'
                        }
                        size="sm"
                        className={clsx(
                          'rounded-xl border border-border/60 py-2 text-sm',
                          selectedRatio === option.id
                            ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            : 'bg-background/80 hover:bg-muted'
                        )}
                        disabled={isGenerating}
                        onClick={() => setSelectedRatio(option.id)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </section>

                <Separator />

                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      快捷提问
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        const random =
                          discoveryPrompts[
                            Math.floor(Math.random() * discoveryPrompts.length)
                          ]
                        setInput(random || '')
                      }}
                    >
                      随机灵感
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedPrompts.map(prompt => (
                      <Badge
                        key={prompt}
                        variant="outline"
                        className="cursor-pointer rounded-full border-border/60 bg-background/80 px-4 py-2 text-xs font-normal hover:border-primary hover:text-primary"
                        onClick={() => setInput(prompt)}
                      >
                        {prompt}
                      </Badge>
                    ))}
                  </div>
                </section>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-background/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  灵感发现
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  使用热门灵感探索不同的构图与氛围。
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {discoveryPrompts.map(prompt => (
                  <button
                    key={prompt}
                    type="button"
                    className="w-full rounded-2xl border border-border/60 bg-muted/40 p-4 text-sm text-left shadow-sm transition hover:border-primary/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    onClick={() => setInput(prompt)}
                  >
                    <p className="text-foreground">{prompt}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      点击填入描述，快速尝试不同主题。
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
