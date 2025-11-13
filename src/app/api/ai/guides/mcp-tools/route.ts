import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'

// Choose the correct import based on your node_modules structure.
// import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse'
// import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp'
// Or, if the correct path is '@modelcontextprotocol/sdk/stdio', use:
// import { StdioClientTransport } from '@modelcontextprotocol/sdk/stdio'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    // Note: MCP client setup is currently disabled
    // Uncomment and configure the following code when you have MCP servers ready:

    // const transport = new StdioClientTransport({
    //   command: 'node',
    //   args: ['src/stdio/dist/server.js'],
    // })
    // const clientOne = await experimental_createMCPClient({ transport })

    // const httpTransport = new StreamableHTTPClientTransport(
    //   new URL('http://localhost:3000/mcp')
    // )
    // const clientTwo = await experimental_createMCPClient({ transport: httpTransport })

    // const sseTransport = new SSEClientTransport(
    //   new URL('http://localhost:3000/sse')
    // )
    // const clientThree = await experimental_createMCPClient({ transport: sseTransport })

    // const toolSetOne = await clientOne.tools()
    // const toolSetTwo = await clientTwo.tools()
    // const toolSetThree = await clientThree.tools()
    // const tools = { ...toolSetOne, ...toolSetTwo, ...toolSetThree }

    // For now, return a demo response without MCP tools
    const result = await streamText({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant. Note: MCP tools are not configured yet. This is a demo response.',
        },
        {
          role: 'user',
          content: prompt || 'Hello',
        },
      ],
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('MCP Tools API Error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
