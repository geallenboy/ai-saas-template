'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <span className="text-xl font-bold">AI SAAS</span>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md">
              Modern AI SAAS platform built with Next.js 15 and React 19
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
              Product
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/pricing"
                  className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
              Support
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/contact"
                  className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; 2026 AI SAAS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
