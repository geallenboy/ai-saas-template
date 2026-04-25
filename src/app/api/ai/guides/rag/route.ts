import { openai } from '@ai-sdk/openai'
import { convertToModelMessages, streamText } from 'ai'

export const maxDuration = 60

export async function POST(req: Request) {
    const { messages, documentContext } = await req.json()

    const systemPrompt = documentContext
        ? `你是一个专业的文档分析助手。请基于以下文档内容回答用户的问题。如果问题与文档内容无关，请礼貌地说明。

--- 文档内容 ---
${documentContext}
--- 文档内容结束 ---

请基于以上文档内容回答用户的问题。引用文档中的具体内容来支持你的回答。`
        : '你是一个乐于助人的 AI 助手。用户还未提供文档内容，请提醒用户先在左侧面板粘贴文档内容。'

    const result = streamText({
        model: openai('gpt-4o-mini'),
        system: systemPrompt,
        messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
}
