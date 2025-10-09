import type { Metadata } from 'next'

import { ChatApp } from '@/components/front/chat/chat-app'

export const metadata: Metadata = {
  title: 'AI 多模态对话',
}

export default function AichatPage() {
  return <ChatApp />
}
