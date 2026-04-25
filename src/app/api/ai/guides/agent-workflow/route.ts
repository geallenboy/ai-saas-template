import { openai } from '@ai-sdk/openai'
import { convertToModelMessages, stepCountIs, streamText, tool } from 'ai'
import { z } from 'zod'

export const maxDuration = 60

const tools = {
    searchWeb: tool({
        description: 'Search the web for information on a given topic',
        inputSchema: z.object({
            query: z.string().describe('The search query'),
        }),
        execute: async ({ query }) => {
            // Simulated web search results
            return `Search results for "${query}":\n1. ${query} - Wikipedia overview\n2. Latest news about ${query}\n3. ${query} tutorial and guide`
        },
    }),
    getWeather: tool({
        description: 'Get current weather for a city',
        inputSchema: z.object({
            city: z.string().describe('City name'),
        }),
        execute: async ({ city }) => {
            const temps: Record<string, number> = {
                beijing: 28,
                shanghai: 30,
                tokyo: 25,
                'new york': 22,
            }
            const temp = temps[city.toLowerCase()] ?? Math.floor(Math.random() * 30 + 5)
            return `${city}: ${temp}°C, partly cloudy`
        },
    }),
    calculate: tool({
        description: 'Perform a mathematical calculation',
        inputSchema: z.object({
            expression: z.string().describe('Math expression to evaluate, e.g. "2 + 3 * 4"'),
        }),
        execute: async ({ expression }) => {
            try {
                // Simple safe eval for basic math
                const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '')
                const result = new Function(`return (${sanitized})`)()
                return `${expression} = ${result}`
            } catch {
                return `Could not evaluate: ${expression}`
            }
        },
    }),
    getCurrentTime: tool({
        description: 'Get the current date and time',
        inputSchema: z.object({}),
        execute: async () => {
            return `Current time: ${new Date().toISOString()}`
        },
    }),
}

export async function POST(req: Request) {
    const { messages } = await req.json()

    const result = streamText({
        model: openai('gpt-4o-mini'),
        system: `You are an AI agent that can use tools to help users. You have access to web search, weather, calculator, and time tools. 
When a user asks a question, think step by step:
1. Determine which tools you need
2. Call the tools to gather information
3. Synthesize the results into a helpful answer

Always explain your reasoning and which tools you used.`,
        messages: await convertToModelMessages(messages),
        tools,
        stopWhen: stepCountIs(5),
    })

    return result.toUIMessageStreamResponse()
}
