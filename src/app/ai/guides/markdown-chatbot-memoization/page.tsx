'use client'

import { Chat, useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState } from 'react'
import { MemoizedMarkdown } from './_components/memoized-markdown'

const chat = new Chat({
  transport: new DefaultChatTransport({
    api: '/api/ai/guides/markdown-chatbot-memoization',
  }),
})

export default function Page() {
  const { messages } = useChat({ chat, experimental_throttle: 50 })

  return (
    <div className="flex flex-col w-full max-w-xl py-24 mx-auto stretch">
      <div className="space-y-8 mb-4">
        {messages.map(message => (
          <div key={message.id}>
            <div className="font-bold mb-2">
              {message.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <div className="prose space-y-2">
              {message.parts.map(part => {
                if (part.type === 'text') {
                  return (
                    <MemoizedMarkdown
                      key={`${message.id}-text`}
                      id={message.id}
                      content={part.text}
                    />
                  )
                }
                return null
              })}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  )
}

const MessageInput = () => {
  const [input, setInput] = useState('')
  const { sendMessage } = useChat({ chat })

  return (
    <form
      onSubmit={event => {
        event.preventDefault()
        sendMessage({
          text: input,
        })
        setInput('')
      }}
    >
      <input
        className="fixed bottom-0 w-full max-w-xl p-2 mb-8 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
        placeholder="Say something..."
        value={input}
        onChange={event => {
          setInput(event.target.value)
        }}
      />
    </form>
  )
}
