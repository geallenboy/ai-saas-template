'use client'

import { PricingPlans } from '@/components/payment'
import FeaturesSection from './features-section'
import HeroSection from './hero-section'

export function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />

      {/* Pricing section */}
      <section className="py-10 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <PricingPlans />
        </div>
      </section>
    </div>
  )
}
