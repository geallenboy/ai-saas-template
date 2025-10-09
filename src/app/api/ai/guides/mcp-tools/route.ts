import { openai } from '@ai-sdk/openai'
// Choose the correct import based on your node_modules structure.

// import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse'
// import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp'
// Or, if the correct path is '@modelcontextprotocol/sdk/stdio', use:
// import { StdioClientTransport } from '@modelcontextprotocol/sdk/stdio'
import { generateText, stepCountIs } from 'ai'

const clientOne: any = null
const clientTwo: any = null
const clientThree: any = null

try {
  // Initialize an MCP client to connect to a `stdio` MCP server:
  // const transport = new StdioClientTransport({
  //   command: 'node',
  //   args: ['src/stdio/dist/server.js'],
  // })

  // const clientOne = await experimental_createMCPClient({
  //   transport,
  // })

  // // You can also connect to StreamableHTTP MCP servers
  // const httpTransport = new StreamableHTTPClientTransport(
  //   new URL('http://localhost:3000/mcp')
  // )
  // const clientTwo = await experimental_createMCPClient({
  //   transport: httpTransport,
  // })

  // Alternatively, you can connect to a Server-Sent Events (SSE) MCP server:
  // const sseTransport = new SSEClientTransport(
  //   new URL('http://localhost:3000/sse')
  // )
  // const clientThree = await experimental_createMCPClient({
  //   transport: sseTransport,
  // })

  const toolSetOne = await clientOne.tools()
  const toolSetTwo = await clientTwo.tools()
  const toolSetThree = await clientThree.tools()
  const tools = {
    ...toolSetOne,
    ...toolSetTwo,
    ...toolSetThree, // note: this approach causes subsequent tool sets to override tools with the same name
  }

  const response = await generateText({
    model: openai('gpt-4o'),
    tools,
    stopWhen: stepCountIs(5),
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: 'Find products under $100' }],
      },
    ],
  })

  console.log(response.text)
} catch (error) {
  console.error(error)
} finally {
  await Promise.all([clientOne.close(), clientTwo.close(), clientThree.close()])
}
