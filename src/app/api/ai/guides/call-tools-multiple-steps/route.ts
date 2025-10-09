import { openai } from '@ai-sdk/openai'
import {
  convertToModelMessages,
  type InferUITools,
  stepCountIs,
  streamText,
  type ToolSet,
  tool,
  type UIDataTypes,
  type UIMessage,
} from 'ai'
import { z } from 'zod'

const tools = {
  getLocation: tool({
    description: 'Get the location of the user',
    inputSchema: z.object({}),
    execute: async () => {
      const location = { lat: 37.7749, lon: -122.4194 }
      return `Your location is at latitude ${location.lat} and longitude ${location.lon}`
    },
  }),
  getWeather: tool({
    description: 'Get the weather for a location',
    inputSchema: z.object({
      city: z.string().describe('The city to get the weather for'),
      unit: z
        .enum(['C', 'F'])
        .describe('The unit to display the temperature in'),
    }),
    execute: async ({ city, unit }) => {
      const weather = {
        value: 24,
        description: 'Sunny',
      }

      return `It is currently ${weather.value}°${unit} and ${weather.description} in ${city}!`
    },
  }),
} satisfies ToolSet

export type ChatTools = InferUITools<typeof tools>

export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>

export async function POST(req: Request) {
  const { messages }: { messages: ChatMessage[] } = await req.json()

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools,
  })

  return result.toUIMessageStreamResponse()
}
