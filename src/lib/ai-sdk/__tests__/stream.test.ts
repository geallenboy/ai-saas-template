import { describe, expect, it, vi } from 'vitest'

import { parseSseStream } from '../stream'

const encoder = new TextEncoder()

describe('parseSseStream', () => {
  it('parses SSE data events and ignores [DONE]', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"chunk":1}\n\n'))
        controller.enqueue(encoder.encode('data: {"chunk":2}\n\n'))
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    const onChunk = vi.fn()
    const onDone = vi.fn()

    await parseSseStream(stream, {
      onChunk,
      onDone,
      parse: JSON.parse,
    })

    expect(onChunk).toHaveBeenCalledTimes(2)
    expect(onChunk).toHaveBeenNthCalledWith(1, { chunk: 1 })
    expect(onChunk).toHaveBeenNthCalledWith(2, { chunk: 2 })
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('aborts gracefully when the signal is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()

    const stream = new ReadableStream<Uint8Array>({
      start(controllerStream) {
        controllerStream.enqueue(encoder.encode('data: {"chunk":1}\n\n'))
        controllerStream.close()
      },
    })

    const onChunk = vi.fn()

    await parseSseStream(stream, {
      onChunk,
      parse: JSON.parse,
      signal: controller.signal,
    })

    expect(onChunk).not.toHaveBeenCalled()
  })

  it('forwards parse errors to the onError callback', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"chunk":1}\n\n'))
        controller.close()
      },
    })

    const onError = vi.fn()

    await parseSseStream(stream, {
      parse: () => {
        throw new Error('parse failure')
      },
      onChunk: vi.fn(),
      onError,
    })

    expect(onError).toHaveBeenCalled()
  })
})
