import type { AiStreamCallbacks } from './types'

const DEFAULT_DONE_EVENT = '[DONE]'
const DATA_PREFIX = 'data:'

const extractEventData = (eventChunk: string) => {
  const dataLines: string[] = []

  for (const rawLine of eventChunk.split('\n')) {
    const line = rawLine.trim()
    if (!line) {
      continue
    }

    if (!line.startsWith(DATA_PREFIX)) {
      continue
    }

    dataLines.push(line.slice(DATA_PREFIX.length).trimStart())
  }

  if (dataLines.length === 0) {
    return undefined
  }

  return dataLines.join('\n')
}

export interface ParseSseStreamOptions<TChunk>
  extends AiStreamCallbacks<TChunk> {
  parse?: (payload: string) => TChunk
  signal?: AbortSignal
}

export const parseSseStream = async <TChunk>(
  stream: ReadableStream<Uint8Array>,
  options: ParseSseStreamOptions<TChunk>
) => {
  const { parse, signal, onChunk, onDone, onError } = options
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const finalize = () => {
    if (typeof onDone === 'function') {
      onDone()
    }
  }

  try {
    while (true) {
      if (signal?.aborted) {
        return
      }

      const { value, done } = await reader.read()
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split('\n\n')
      buffer = events.pop() ?? ''

      for (const event of events) {
        const payload = extractEventData(event)
        if (!payload || payload === DEFAULT_DONE_EVENT) {
          continue
        }

        try {
          const parsed = parse ? parse(payload) : (payload as unknown as TChunk)
          onChunk?.(parsed)
        } catch (error) {
          if (onError) {
            onError(error as Error)
            return
          }
          throw error
        }
      }
    }

    buffer += decoder.decode()

    if (buffer) {
      const payload = extractEventData(buffer)
      if (payload && payload !== DEFAULT_DONE_EVENT) {
        const parsed = parse ? parse(payload) : (payload as unknown as TChunk)
        onChunk?.(parsed)
      }
    }

    finalize()
  } catch (error) {
    if (onError) {
      onError(error as Error)
      return
    }
    throw error
  } finally {
    reader.releaseLock()
  }
}
