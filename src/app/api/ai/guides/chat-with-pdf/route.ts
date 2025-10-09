import { openai } from '@ai-sdk/openai'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { logger } from '@/lib/logger'

const MODEL_CONTEXT_LIMIT = 16000

function truncateContext(
  text: string,
  maxLength: number = MODEL_CONTEXT_LIMIT
): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength)
}

interface PdfTextPayload {
  filename: string
  content: string
}

function isPdfFilePart(
  part: UIMessage['parts'][number]
): part is UIMessage['parts'][number] & {
  type: 'file'
  filename?: string
  mediaType?: string
  url?: string
} {
  return part?.type === 'file' && typeof part === 'object' && part !== null
}

function dataUrlToBuffer(dataUrl: string): Buffer {
  const match = dataUrl.match(/^data:.*?;base64,(.+)$/)
  if (!match || typeof match[1] !== 'string') {
    throw new Error('无法解析文件 Data URL')
  }
  return Buffer.from(match[1], 'base64')
}

async function extractPdfTextsFromMessages(
  messages: UIMessage[]
): Promise<PdfTextPayload[]> {
  const pdfParts: PdfTextPayload[] = []

  for (const message of messages) {
    if (message.role !== 'user' || !message.parts) continue

    for (const part of message.parts) {
      if (!isPdfFilePart(part)) continue

      const mediaType = (part as { mediaType?: string }).mediaType ?? ''
      const filename =
        (part as { filename?: string }).filename ?? '未命名文档.pdf'
      if (
        mediaType &&
        !mediaType.includes('pdf') &&
        !filename.endsWith('.pdf')
      ) {
        continue
      }

      const url = (part as { url?: string }).url
      if (!url) continue

      try {
        const buffer = dataUrlToBuffer(url)
        const extracted = await simulatePdfExtraction(buffer, filename)
        pdfParts.push({
          filename,
          content: extracted,
        })
      } catch (error) {
        logger.warn('解析 PDF 附件失败', { filename, error })
      }
    }
  }

  return pdfParts
}

async function simulatePdfExtraction(
  buffer: Buffer,
  filename: string
): Promise<string> {
  logger.info('模拟解析 PDF 附件', { filename, size: buffer.length })
  return `这是从 ${filename} 提取的示例文本内容。\n\n在实际生产环境中，这里会是真实的PDF文本内容。\n\n您可以基于这个文档内容进行问答对话。`
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      sessionId: _sessionId,
      pdfTexts,
    }: {
      messages: UIMessage[]
      sessionId?: string
      pdfTexts?: PdfTextPayload[]
    } = await req.json()

    let attachedPdfTexts: PdfTextPayload[] = Array.isArray(pdfTexts)
      ? pdfTexts
      : []

    if (attachedPdfTexts.length === 0) {
      attachedPdfTexts = await extractPdfTextsFromMessages(messages)
    }

    let systemMessage =
      '你是一个专业的文档分析助手，专门帮助用户理解和分析PDF文档内容。'

    if (attachedPdfTexts.length > 0) {
      let combinedContent = ''
      attachedPdfTexts.forEach((pdf, index) => {
        const truncatedContent = truncateContext(
          pdf.content,
          Math.floor(MODEL_CONTEXT_LIMIT / attachedPdfTexts.length)
        )
        combinedContent += `\n--- 文档 ${index + 1}: ${pdf.filename} ---\n${truncatedContent}\n`
      })

      systemMessage += `\n\n以下是用户提供的 ${attachedPdfTexts.length} 个文档内容：\n${combinedContent}\n--- 文档内容结束 ---\n\n请基于以上文档内容回答用户的问题。如果问题与文档内容无关，请礼貌地说明你只能回答与已上传文档相关的问题。在回答时，如果涉及特定文档，请指明是来自哪个文档。`
    } else {
      systemMessage +=
        '\n\n用户还未提供任何 PDF 文档。请提醒用户先上传或附加 PDF 文件，然后你才能基于文档内容进行智能问答对话。'
    }

    const messagesWithSystem = [
      { role: 'system' as const, content: systemMessage },
      ...convertToModelMessages(messages),
    ]

    const result = streamText({
      model: openai('gpt-4o'),
      messages: messagesWithSystem,
      temperature: 0.5,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    logger.error(
      '聊天 API 错误:',
      error instanceof Error ? error : new Error(String(error))
    )
    return new Response(
      JSON.stringify({
        error: '处理您的请求时出现错误，请稍后重试。',
        details: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
