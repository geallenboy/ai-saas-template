'use client'

import { Mail, Send } from 'lucide-react'
import { Footer, Navigation } from '@/components/front/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function ContactPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-br from-white via-gray-50/90 to-blue-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* 页面标题 */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              联系我们
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              与我们取得联系，我们很乐意听到您的声音！
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 联系信息 */}
            <div className="space-y-8">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  联系方式
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        邮箱
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        gejialun88@gmail.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 工作时间 */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  工作时间
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      周一 - 周五
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      9:00 - 18:00
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      周六
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      10:00 - 16:00
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      周日
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      休息
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 联系表单 */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                发送消息
              </h2>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      姓名
                    </label>
                    <Input id="name" placeholder="您的姓名" />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      邮箱
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    主题
                  </label>
                  <Input id="subject" placeholder="我们如何帮助您？" />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    消息内容
                  </label>
                  <Textarea id="message" placeholder="您的消息..." rows={6} />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  size="lg"
                >
                  <Send className="h-5 w-5 mr-2" />
                  发送消息
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
