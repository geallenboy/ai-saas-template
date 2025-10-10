import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ChatApp } from '@/components/front/chat/chat-app'

export const metadata: Metadata = {
  title: 'AI 多模态对话',
}

interface ChatSessionPageProps {
  params: Promise<{
    sessionId: string // 从URL路径中提取的对话ID
  }>
  searchParams: Promise<{
    message?: string // 从新对话页面传递的消息
    modelId?: string // 模型ID
  }>
}

/**
 * UUID格式验证正则表达式
 *
 * 为什么需要验证：
 * 1. 安全性：防止恶意或无效的URL参数
 * 2. 用户体验：及早发现无效链接，避免后续API错误
 * 3. 性能：避免无效请求到达后端API
 * 4. 一致性：确保所有sessionId都符合系统预期格式
 *
 * UUID标准格式：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 * 示例：550e8400-e29b-41d4-a716-446655440000
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * 聊天特定对话页面组件
 *
 * 工作流程：
 * 1. 接收URL中的sessionId参数
 * 2. 验证sessionId是否为有效的UUID格式
 * 3. 如果无效，重定向到新对话页面
 * 4. 如果有效，将sessionId传递给ChatApp组件加载对应对话
 *
 * @param params - Next.js动态路由参数，包含sessionId
 * @returns 渲染ChatApp组件或执行重定向
 */
export default async function ChatSessionPage({
  params,
  searchParams,
}: ChatSessionPageProps) {
  // Next.js 15 要求: params 和 searchParams 现在是 Promise，需要 await
  const { sessionId } = await params
  const { message, modelId } = await searchParams
  /**
   * 前端UUID格式验证
   *
   * 设计考虑：
   * 1. 快速失败：在前端就拦截明显无效的ID，避免无效API请求
   * 2. 用户友好：立即重定向到新对话，而不是显示错误页面
   * 3. 性能优化：减少后端压力和网络请求
   * 4. 一致性：确保只有符合规范的UUID才能进入聊天系统
   *
   * 注意：这里只做格式验证，不验证该ID是否真实存在
   * 真实性验证由ChatApp组件中的API查询来处理
   */
  if (!UUID_REGEX.test(sessionId)) {
    // 重定向到新对话页面，而不是显示404
    // 这样用户可以立即开始新的对话，提供更好的体验
    redirect('/ai/chat')
  }

  return (
    <ChatApp
      initialSessionId={sessionId}
      initialMessage={message}
      initialModelId={modelId}
    />
  )
}
