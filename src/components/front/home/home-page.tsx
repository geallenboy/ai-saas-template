'use client'

import FeaturesSection from './features-section'
import HeroSection from './hero-section'

export function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
    </div>
  )
}
