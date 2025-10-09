import { openai } from '@ai-sdk/openai'
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  tool,
} from 'ai'
import { z } from 'zod'

/**
 * 这是一个使用常规编程结构（如 async/await, if-else, for-loop 等）实现的多步骤流式响应的示例。
 * 每个步骤都可以使用不同的模型、不同的系统提示、不同的工具等。
 * 整个工作流通过将上一步骤生成的消息转发到下一步骤的方式连接在一起。
 * @param req Request - Next.js 传入的请求对象。
 * @returns Response - 一个流式响应对象。
 */
export async function POST(req: Request) {
  // 从请求体中解析出前端发送过来的消息数组。
  const { messages } = await req.json()

  // 创建一个可以发送给前端UI的流。
  // 这个流是专门设计的，可以包含多个步骤，并将它们合并成一个单一的、连续的流。
  const stream = createUIMessageStream({
    // `execute` 是一个异步生成器函数，我们在这里定义多步骤工作流。
    execute: async ({ writer }) => {
      // --- 步骤 1: 强制调用工具来提取用户目标 ---
      const result1 = streamText({
        // 使用一个较小、较快的模型来执行这个简单的提取任务。
        model: openai('gpt-4o-mini'),
        // 系统提示，指导模型只做一件事：提取目标。
        system: '从对话中提取用户的目标。',
        // 将从UI接收到的消息转换为AI SDK要求的格式。
        messages: convertToModelMessages(messages),
        // `toolChoice: 'required'` 强制模型必须调用一个工具，而不是直接生成文本。
        toolChoice: 'required',
        // 定义可供模型使用的工具。
        tools: {
          // 工具名称为 `extractGoal`。
          extractGoal: tool({
            // 使用 Zod 定义工具的输入参数结构，这里需要一个名为 `goal` 的字符串。
            inputSchema: z.object({ goal: z.string() }),
            // `execute` 函数是当模型决定调用此工具时实际执行的代码。
            // 这里它只是一个“无操作”的提取工具，直接返回提取到的 `goal`。
            execute: async ({ goal }) => goal,
          }),
        },
      })

      // 将第1步的结果合并到主UI流中，并发送给客户端。
      // `sendFinish: false` 非常重要，因为它告诉客户端，这只是流的一部分，整个过程还没有结束。
      writer.merge(result1.toUIMessageStream({ sendFinish: false }))

      // 注意：在这个工作流中，你可以使用任何标准的编程逻辑，比如 if-else 判断或 for 循环。
      // 这种方式让AI工作流的编程变得像普通编程一样直观。

      // --- 步骤 2: 使用上一步提取的目标来生成最终回复 ---
      const result2 = streamText({
        // 使用一个更强大的模型来生成最终的、高质量的回复。
        model: openai('gpt-4o'),
        // 使用一个不同的系统提示。
        system:
          '你是一个乐于助人的助手，有着不同的系统提示。请在你的回答中重复提取出的用户目标。',
        // 构造用于此步骤的消息历史。
        // 这是将多步骤连接起来的关键：
        // 它包含了原始的对话历史，并附加了第1步（result1）中生成的所有消息（包括工具调用和结果）。
        messages: [
          ...convertToModelMessages(messages),
          ...(await result1.response).messages,
        ],
      })

      // 将第2步的结果合并到主UI流中。
      // `sendStart: false` 告诉客户端不要再发送一个新的开始事件，因为这只是同一个流的延续。
      // 默认情况下，这次会发送 `finish` 事件，因为它是流的最后一部分。
      writer.merge(result2.toUIMessageStream({ sendStart: false }))
    },
  })

  // 创建并返回最终的流式HTTP响应。
  return createUIMessageStreamResponse({ stream })
}
