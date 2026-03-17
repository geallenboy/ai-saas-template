import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Home from '@/app/page'

vi.mock('@/components/front/home', () => ({
  HomePage: () => <main data-testid="home-page">Home Page</main>,
}))

vi.mock('@/components/front/layout', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
  Navigation: () => <nav data-testid="navigation">Navigation</nav>,
}))

describe('Home page', () => {
  it('renders navigation, hero and footer sections', () => {
    render(<Home />)

    expect(screen.getByTestId('navigation')).toBeInTheDocument()
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })
})
