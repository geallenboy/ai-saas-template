import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

type ApiPayload = Record<string, unknown>

function sendJson(
  res: ServerResponse,
  status: number,
  payload: ApiPayload
): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}

function handleCompatibilityApi(
  req: IncomingMessage,
  res: ServerResponse
): boolean {
  const method = req.method ?? 'GET'
  const pathname = req.url?.split('?')[0]

  if (method === 'GET' && pathname === '/api/health') {
    sendJson(res, 200, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: typeof process.uptime === 'function' ? process.uptime() : 0,
      environment: process.env.NODE_ENV,
    })
    return true
  }

  if (method === 'GET' && pathname === '/api/auth/get-session') {
    sendJson(res, 200, {
      session: null,
      user: null,
    })
    return true
  }

  return false
}

function compatibilityApiPlugin(): Plugin {
  return {
    name: 'compatibility-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (handleCompatibilityApi(req, res)) {
          return
        }
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (handleCompatibilityApi(req, res)) {
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), compatibilityApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
})
