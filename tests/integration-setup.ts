import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
// Mock Next.js router
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock environment variables
vi.mock('@/env', () => ({
  env: {
    NODE_ENV: 'test',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  },
  isDev: false,
  isProd: false,
  isTest: true,
}))

// Mock logger to avoid console noise in tests
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    performance: vi.fn(),
    userAction: vi.fn(),
  },
}))

// Setup and teardown
beforeAll(() => {
  // Global setup for integration tests
})

afterAll(() => {
  // Global cleanup for integration tests
})

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks()
})

afterEach(() => {
  // Cleanup after each test
  cleanup()
})
