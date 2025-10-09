'use client'

import Link from 'next/link'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const guides = [
  {
    href: '/ai/guides/chat-with-pdf',
    title: 'PDF 聊天机器人',
    description: '学习如何构建一个可以回答 PDF 文档相关问题的聊天机器人。',
  },
  {
    href: '/ai/guides/generate-image',
    title: '图像生成',
    description: '学习如何根据文本提示生成图像。',
  },
  {
    href: '/ai/guides/generate-text',
    title: '文本生成',
    description: '学习如何根据提示生成文本内容。',
  },
  {
    href: '/ai/guides/stream-image',
    title: '图像流式生成',
    description: '学习如何实时流式生成图像。',
  },
  {
    href: '/ai/guides/stream-text',
    title: '文本流式生成',
    description: '学习如何实时流式生成文本内容。',
  },
  {
    href: '/ai/guides/stream-text-multistep',
    title: '多步骤文本流式生成',
    description: '学习如何构建多步骤的文本流式生成功能。',
  },
  {
    href: '/ai/guides/markdown-chatbot-memoization',
    title: '带有备忘功能的 Markdown 聊天机器人',
    description:
      '学习如何构建一个具有备忘功能的 Markdown 聊天机器人，提升性能表现。',
  },
  {
    href: '/ai/guides/generate-object',
    title: '结构化对象生成',
    description: '学习如何根据文本提示生成结构化的对象数据。',
  },
  {
    href: '/ai/guides/call-tools',
    title: '工具调用',
    description: '学习如何构建一个可以调用外部工具来回答问题的聊天机器人。',
  },
  {
    href: '/ai/guides/call-tools-multiple-steps',
    title: '多步骤工具调用',
    description:
      '学习如何构建一个可以通过多步骤调用外部工具来回答复杂问题的聊天机器人。',
  },
  {
    href: '/ai/guides/mcp-tools',
    title: 'MCP 工具集成',
    description: '学习如何集成和使用 Model Context Protocol (MCP) 工具。',
  },
]

export default function GuidesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">AI SDK 使用指南</h1>
        <p className="text-muted-foreground text-lg">
          通过这些实用指南学习和掌握 AI SDK 的各种功能和最佳实践
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {guides.map(guide => (
          <Link href={guide.href} key={guide.href} className="group">
            <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 group-hover:bg-accent/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary">
                  {guide.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                  {guide.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
