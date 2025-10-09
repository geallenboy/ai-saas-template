import { vi } from 'vitest'

// Mock the providers and components that HomePage uses
vi.mock('@/components/providers/global-providers', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('@/components/home/home-page', () => ({
  default: () => <div data-testid="home-page">Home Page Component</div>,
}))
