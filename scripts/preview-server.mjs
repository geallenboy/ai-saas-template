import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'

const DIST_DIR = resolve(process.cwd(), 'dist')
const PORT = Number(process.env.PORT ?? 3000)
const HOST = process.env.HOSTNAME ?? '0.0.0.0'

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
}

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}

function handleApi(req, res) {
  const method = req.method ?? 'GET'
  const pathname = req.url?.split('?')[0] ?? '/'

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

async function fileExists(filePath) {
  try {
    const fileStat = await stat(filePath)
    return fileStat.isFile()
  } catch {
    return false
  }
}

async function sendFile(res, filePath) {
  const ext = extname(filePath)
  const contentType = MIME_TYPES[ext] ?? 'application/octet-stream'
  const fileContent = await readFile(filePath)

  res.statusCode = 200
  res.setHeader('Content-Type', contentType)
  res.end(fileContent)
}

const server = createServer(async (req, res) => {
  if (handleApi(req, res)) {
    return
  }

  const pathname = decodeURIComponent(req.url?.split('?')[0] ?? '/')
  const requestedPath = pathname === '/' ? '/index.html' : pathname
  const normalizedPath = normalize(requestedPath).replace(/^\/+/, '')
  const candidateFile = join(DIST_DIR, normalizedPath)

  if (!candidateFile.startsWith(DIST_DIR)) {
    res.statusCode = 403
    res.end('Forbidden')
    return
  }

  try {
    if (await fileExists(candidateFile)) {
      await sendFile(res, candidateFile)
      return
    }

    await sendFile(res, join(DIST_DIR, 'index.html'))
  } catch (error) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end(
      error instanceof Error ? error.message : 'Internal server error'
    )
  }
})

server.listen(PORT, HOST, () => {
  console.log(`Serving dist on http://${HOST}:${PORT}`)
})
