import { parseSseStream } from './stream'
import type { AiJsonFetchOptions, AiStreamFetchOptions } from './types'

const joinUrl = (baseUrl: string | undefined, path: string) => {
  if (!baseUrl) {
    return path
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${normalizedBase}${normalizedPath}`
}

const readErrorPayload = async (response: Response) => {
  try {
    const text = await response.text()
    return text || response.statusText
  } catch (_error) {
    return response.statusText || 'Unknown error'
  }
}

export interface CreateAiClientOptions {
  baseUrl?: string
  fetchImpl?: typeof fetch
  defaultHeaders?: Record<string, string> | (() => Record<string, string>)
}

export const createAiClient = (options: CreateAiClientOptions) => {
  const { baseUrl, fetchImpl, defaultHeaders } = options
  const fetchFn = fetchImpl ?? fetch

  const resolveHeaders = () => {
    if (typeof defaultHeaders === 'function') {
      return defaultHeaders()
    }

    return defaultHeaders ?? {}
  }

  const request = async <TResponse, TBody = unknown>(
    path: string,
    fetchOptions: AiJsonFetchOptions<TBody> = {}
  ): Promise<TResponse> => {
    const {
      body,
      signal,
      headers,
      method = body === undefined ? 'GET' : 'POST',
    } = fetchOptions

    const url = joinUrl(baseUrl, path)

    const response = await fetchFn(url, {
      method,
      signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...resolveHeaders(),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })

    if (!response.ok) {
      const details = await readErrorPayload(response)
      throw new Error(
        `AI request failed with status ${response.status}: ${details}`
      )
    }

    if (response.status === 204) {
      return undefined as TResponse
    }

    return (await response.json()) as TResponse
  }

  const stream = async <TChunk, TBody = unknown>(
    path: string,
    fetchOptions: AiStreamFetchOptions<TBody, TChunk>
  ) => {
    const {
      body,
      signal,
      headers,
      method = 'POST',
      parse,
      callbacks,
    } = fetchOptions
    const url = joinUrl(baseUrl, path)

    const response = await fetchFn(url, {
      method,
      signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...resolveHeaders(),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })

    if (!response.ok) {
      const details = await readErrorPayload(response)
      throw new Error(
        `AI stream request failed with status ${response.status}: ${details}`
      )
    }

    const readable = response.body
    if (!readable) {
      throw new Error('AI stream response did not include a readable body')
    }

    await parseSseStream(readable, {
      signal,
      parse,
      onChunk: callbacks.onChunk,
      onDone: callbacks.onDone,
      onError: callbacks.onError,
    })
  }

  return { request, stream }
}
