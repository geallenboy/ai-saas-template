import { openai } from '@ai-sdk/openai'
import { convertToModelMessages, streamText } from 'ai'

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Call the language model
  const result = streamText({
    model: openai('gpt-4.1'),
    messages: convertToModelMessages(messages),
  })

  // Respond with the stream
  return result.toUIMessageStreamResponse()
}
