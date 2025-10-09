import { Lock } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { localizePath } from '@/lib/utils'

export const metadata: Metadata = {
  title: '登录 - AI SaaS',
  description: '登录您的账户以继续使用 AI SaaS 服务',
}

export default function LoginPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* 左侧 - 登录表单 */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 py-8 lg:py-0">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          {/* 标题区域 */}
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              欢迎回来
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              登录您的账户继续使用 AI SaaS 服务
            </p>
          </div>

          <LoginForm />

          <div className="text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            <p>
              通过登录，您同意我们的{' '}
              <Link
                href={localizePath(locale, '/terms')}
                className="text-blue-600 hover:text-blue-500 transition-colors duration-300"
              >
                服务条款
              </Link>{' '}
              和{' '}
              <Link
                href={localizePath(locale, '/privacy')}
                className="text-blue-600 hover:text-blue-500 transition-colors duration-300"
              >
                隐私政策
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* 右侧 - 装饰区域 */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 xl:w-96 xl:h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
          <div
            className="absolute bottom-20 right-10 w-48 h-48 xl:w-80 xl:h-80 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl animate-float"
            style={{ animationDelay: '1s' }}
          />
        </div>

        {/* 内容 */}
        <div className="relative z-10 flex items-center justify-center p-8 xl:p-12">
          <div className="text-center text-white max-w-md xl:max-w-lg">
            <h3 className="text-3xl xl:text-4xl font-bold mb-4 xl:mb-6">
              开始您的 AI 之旅
            </h3>
            <p className="text-lg xl:text-xl opacity-90 mb-6 xl:mb-8 leading-relaxed">
              加入超过 10,000 名用户的社区，
              <br className="hidden xl:block" />
              使用智能化工具提升您的工作效率。
            </p>
            <div className="flex items-center justify-center gap-6 xl:gap-8">
              <div className="text-center">
                <div className="text-2xl xl:text-3xl font-bold">10K+</div>
                <div className="text-xs xl:text-sm opacity-75">用户</div>
              </div>
              <div className="text-center">
                <div className="text-2xl xl:text-3xl font-bold">50+</div>
                <div className="text-xs xl:text-sm opacity-75">国家</div>
              </div>
              <div className="text-center">
                <div className="text-2xl xl:text-3xl font-bold">99.9%</div>
                <div className="text-xs xl:text-sm opacity-75">正常运行</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
