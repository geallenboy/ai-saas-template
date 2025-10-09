import { openai } from '@ai-sdk/openai'
import { generateText, type ModelMessage } from 'ai'

export async function POST(req: Request) {
  const { messages }: { messages: ModelMessage[] } = await req.json()

  const { response } = await generateText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    messages,
  })

  return Response.json({ messages: response.messages })
}
