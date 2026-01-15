import { Lock } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: '登录 - AI SaaS',
  description: '登录您的账户以继续使用 AI SaaS 服务',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 py-8 lg:py-0">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          {/* Title Area */}
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Login to your account to continue using AI SaaS services
            </p>
          </div>

          <LoginForm />

          <div className="text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            <p>
              By logging in, you agree to our{' '}
              <Link
                href="/terms"
                className="text-blue-600 hover:text-blue-500 transition-colors duration-300"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-500 transition-colors duration-300"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right - Decoration Area */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 xl:w-96 xl:h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
          <div
            className="absolute bottom-20 right-10 w-48 h-48 xl:w-80 xl:h-80 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl animate-float"
            style={{ animationDelay: '1s' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center p-8 xl:p-12">
          <div className="text-center text-white max-w-md xl:max-w-lg">
            <h3 className="text-3xl xl:text-4xl font-bold mb-4 xl:mb-6">
              Start Your AI Journey
            </h3>
            <p className="text-lg xl:text-xl opacity-90 mb-6 xl:mb-8 leading-relaxed">
              Join over 10,000 users in our community,
              <br className="hidden xl:block" />
              using intelligent tools to boost your productivity.
            </p>
            <div className="flex items-center justify-center gap-6 xl:gap-8">
              <div className="text-center">
                <div className="text-2xl xl:text-3xl font-bold">10K+</div>
                <div className="text-xs xl:text-sm opacity-75">Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl xl:text-3xl font-bold">50+</div>
                <div className="text-xs xl:text-sm opacity-75">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl xl:text-3xl font-bold">99.9%</div>
                <div className="text-xs xl:text-sm opacity-75">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
