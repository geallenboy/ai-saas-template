import { describe, expect, it, vi } from 'vitest'

import { createAiClient } from '../client'
import * as streamModule from '../stream'

const jsonResponse = (data: unknown, init?: ResponseInit) => {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

describe('createAiClient', () => {
  it('performs JSON requests with normalized URLs', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ ok: true }))

    const client = createAiClient({
      baseUrl: 'https://api.example.com/',
      fetchImpl: fetchMock,
      defaultHeaders: { Authorization: 'Bearer token' },
    })

    const response = await client.request<{ ok: boolean }, { message: string }>(
      'chat',
      { body: { message: 'hi' } }
    )

    expect(response).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/chat',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ message: 'hi' }),
        headers: expect.objectContaining({ Authorization: 'Bearer token' }),
      })
    )
  })

  it('returns undefined for 204 responses', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, {
        status: 204,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const client = createAiClient({ fetchImpl: fetchMock })
    const result = await client.request('/ping')

    expect(result).toBeUndefined()
  })

  it('throws descriptive errors on failure', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('Bad things happened', {
        status: 500,
        statusText: 'Server Error',
      })
    )

    const client = createAiClient({ fetchImpl: fetchMock })

    await expect(
      client.request('/chat', { body: { message: 'hi' } })
    ).rejects.toThrow(/status 500/)
  })

  it('delegates SSE parsing to parseSseStream', async () => {
    const parseSpy = vi
      .spyOn(streamModule, 'parseSseStream')
      .mockResolvedValue(undefined)

    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('data: hello\n\n', {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      })
    )

    const onChunk = vi.fn()
    const client = createAiClient({ fetchImpl: fetchMock })

    await client.stream('/chat', {
      body: { message: 'hi' },
      callbacks: { onChunk },
      parse: data => ({ data }),
    })

    expect(parseSpy).toHaveBeenCalled()
    expect(parseSpy.mock.calls[0]?.[1]).toMatchObject({
      onChunk,
    })

    parseSpy.mockRestore()
  })
})
