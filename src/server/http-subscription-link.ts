import type { TRPCLink } from '@trpc/client'
import { TRPCClientError } from '@trpc/client'
import {
  getTransformer,
  type TRPCConnectionState,
  type TransformerOptions,
} from '@trpc/client/unstable-internals'
import { behaviorSubject, observable } from '@trpc/server/observable'
import type { TRPCErrorShape, TRPCResult } from '@trpc/server/rpc'
import type {
  AnyClientTypes,
  EventSourceLike,
  InferrableClientTypes,
  inferClientTypes,
} from '@trpc/server/unstable-core-do-not-import'
import {
  retryableRpcCodes,
  run,
  sseStreamConsumer,
} from '@trpc/server/unstable-core-do-not-import'

// Helpers mirrored from @trpc/client internals while we wait for an official export
const resultOf = async <T, TArgs extends any[]>(
  value: T | ((...args: TArgs) => T | Promise<T>),
  ...args: TArgs
): Promise<T> => {
  if (typeof value === 'function') {
    return await (value as (...innerArgs: TArgs) => T | Promise<T>)(...args)
  }

  return value
}

type CallbackOrValue<T> = T | (() => T | Promise<T>)

type Maybe<T> = T | null | undefined

type Operation<TInput = unknown> = {
  id: number
  type: 'query' | 'mutation' | 'subscription'
  path: string
  input: TInput
  context: Record<string, unknown>
  signal?: AbortSignal
}

const raceAbortSignals = (...signals: Maybe<AbortSignal>[]): AbortSignal => {
  const controller = new AbortController()

  for (const signal of signals) {
    if (signal?.aborted) {
      controller.abort(signal.reason)
    } else {
      signal?.addEventListener('abort', () => controller.abort(signal.reason), {
        once: true,
      })
    }
  }

  return controller.signal
}

const inputWithTrackedEventId = <TInput>(
  input: TInput,
  lastEventId: string | undefined
): TInput => {
  if (!lastEventId) {
    return input
  }

  if (input != null && typeof input === 'object') {
    return {
      ...(input as Record<string, unknown>),
      lastEventId,
    } as TInput
  }

  return input
}

const resolveUrl = (baseUrl: string, path: string) => {
  const normalizedBase = baseUrl.replace(/\/$/, '')
  const normalizedPath = path.replace(/^\//, '')
  const fullPath = `${normalizedBase}/${normalizedPath}`

  if (/^https?:/i.test(fullPath)) {
    return fullPath
  }

  const globalWindow =
    typeof window === 'undefined' ? undefined : (window as typeof window)

  if (globalWindow?.location) {
    return new URL(fullPath, globalWindow.location.origin).toString()
  }

  return fullPath
}

type BuildSubscriptionUrlOptions = {
  baseUrl: string
  path: string
  input: unknown
  transformer: ReturnType<typeof getTransformer>
  lastEventId: string | undefined
  connectionParams?: unknown
}

const buildSubscriptionUrl = async (opts: BuildSubscriptionUrlOptions) => {
  const url = new URL(resolveUrl(opts.baseUrl, opts.path))

  const serializedInput =
    opts.input === undefined
      ? undefined
      : opts.transformer.input.serialize(
          inputWithTrackedEventId(opts.input, opts.lastEventId)
        )

  if (serializedInput !== undefined) {
    url.searchParams.set('input', JSON.stringify(serializedInput))
  }

  url.searchParams.set('type', 'subscription')

  if (opts.connectionParams !== undefined) {
    url.searchParams.set(
      'connectionParams',
      encodeURIComponent(JSON.stringify(opts.connectionParams))
    )
  }

  return url.toString()
}

type HTTPSubscriptionLinkOptions<
  TRoot extends AnyClientTypes,
  TEventSource extends EventSourceLike.AnyConstructor = typeof EventSource,
> = {
  url: CallbackOrValue<string>
  connectionParams?: CallbackOrValue<unknown>
  EventSource?: TEventSource
  eventSourceOptions?:
    | EventSourceLike.InitDictOf<TEventSource>
    | ((opts: {
        op: Operation
      }) =>
        | EventSourceLike.InitDictOf<TEventSource>
        | Promise<EventSourceLike.InitDictOf<TEventSource>>)
} & TransformerOptions<TRoot>

type SubscriptionObserver = {
  next: (opts: {
    result:
      | TRPCConnectionState<TRPCClientError<any>>
      | TRPCResult<unknown>
      | { type: 'started' }
      | { type: 'stopped' }
    context?: Record<string, unknown>
  }) => void
  error: (err: TRPCClientError<any>) => void
  complete: () => void
}

export function createHttpSubscriptionLink<
  TInferrable extends InferrableClientTypes,
  TEventSource extends EventSourceLike.AnyConstructor,
>(
  opts: HTTPSubscriptionLinkOptions<inferClientTypes<TInferrable>, TEventSource>
): TRPCLink<TInferrable> {
  const transformer = getTransformer(opts.transformer)

  return () => {
    return ({ op, next }) => {
      if (op.type !== 'subscription') {
        return next(op)
      }

      const subscriptionOp = op as Operation
      return observable<Parameters<SubscriptionObserver['next']>[0]>(
        observer => {
          const { path, input } = subscriptionOp

          let lastEventId: string | undefined
          const ac = new AbortController()
          const signal = raceAbortSignals(subscriptionOp.signal, ac.signal)

          const eventSourceStream = sseStreamConsumer<{
            EventSource: TEventSource
            data: Partial<{ id?: string; data: unknown }>
            error: TRPCErrorShape
          }>({
            url: async () => {
              const baseUrl = await resultOf(opts.url)
              const connectionParams = opts.connectionParams
                ? await resultOf(opts.connectionParams)
                : undefined

              return buildSubscriptionUrl({
                baseUrl,
                path,
                input,
                transformer,
                lastEventId,
                connectionParams,
              })
            },
            init: () =>
              resultOf(opts.eventSourceOptions, { op: subscriptionOp }),
            signal,
            deserialize: data => transformer.output.deserialize(data),
            EventSource:
              opts.EventSource ??
              (globalThis.EventSource as never as TEventSource),
          })

          const connectionState = behaviorSubject<
            TRPCConnectionState<TRPCClientError<any>>
          >({
            type: 'state',
            state: 'connecting',
            error: null,
          })

          const connectionSub = connectionState.subscribe({
            next(state) {
              observer.next({
                result: state,
              })
            },
          })

          run(async () => {
            for await (const chunk of eventSourceStream) {
              switch (chunk.type) {
                case 'ping':
                  break
                case 'data': {
                  const chunkData = chunk.data

                  let result: TRPCResult<unknown>
                  if (chunkData.id) {
                    lastEventId = chunkData.id
                    result = {
                      id: chunkData.id,
                      data: chunkData,
                    }
                  } else {
                    result = {
                      data: chunkData.data,
                    }
                  }

                  observer.next({
                    result,
                    context: {
                      eventSource: chunk.eventSource,
                    },
                  })
                  break
                }
                case 'connected':
                  observer.next({
                    result: {
                      type: 'started',
                    },
                    context: {
                      eventSource: chunk.eventSource,
                    },
                  })
                  connectionState.next({
                    type: 'state',
                    state: 'pending',
                    error: null,
                  })
                  break
                case 'serialized-error': {
                  const error = TRPCClientError.from({ error: chunk.error })

                  if (retryableRpcCodes.includes(chunk.error.code)) {
                    connectionState.next({
                      type: 'state',
                      state: 'connecting',
                      error,
                    })
                    break
                  }

                  throw error
                }
                case 'connecting': {
                  const lastState = connectionState.get()

                  const error = chunk.event && TRPCClientError.from(chunk.event)
                  if (!error && lastState.state === 'connecting') {
                    break
                  }

                  connectionState.next({
                    type: 'state',
                    state: 'connecting',
                    error,
                  })
                  break
                }
                case 'timeout':
                  connectionState.next({
                    type: 'state',
                    state: 'connecting',
                    error: new TRPCClientError(
                      `Timeout of ${chunk.ms}ms reached while waiting for a response`
                    ),
                  })
                  break
              }
            }

            observer.next({
              result: {
                type: 'stopped',
              },
            })
            connectionState.next({
              type: 'state',
              state: 'idle',
              error: null,
            })
            observer.complete()
          }).catch(error => {
            observer.error(TRPCClientError.from(error))
          })

          return () => {
            observer.complete()
            ac.abort()
            connectionSub.unsubscribe()
          }
        }
      )
    }
  }
}

export { createHttpSubscriptionLink as httpSubscriptionLink }
