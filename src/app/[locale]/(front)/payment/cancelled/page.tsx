import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, HelpCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentCancelledPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-8">
          {/* cancel icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          {/* Cancel message */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              支付已取消
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              您的支付已被取消，没有产生任何费用
            </p>
          </div>

          {/* information card */}
          <Card className="text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                需要帮助？
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">支付遇到问题？</h4>
                  <p className="text-sm text-muted-foreground">
                    如果您在支付过程中遇到技术问题，请尝试刷新页面或使用其他支付方式。
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">需要更多信息？</h4>
                  <p className="text-sm text-muted-foreground">
                    您可以查看我们的定价详情，或联系客服了解更多关于会员计划的信息。
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">稍后再试</h4>
                  <p className="text-sm text-muted-foreground">
                    您可以随时回到定价页面重新选择适合的会员计划。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/pricing">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回定价页面
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">前往仪表盘</Link>
            </Button>
          </div>

          {/* Contact support */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="ghost" size="sm">
              <Link href="/contact">
                <HelpCircle className="mr-2 h-4 w-4" />
                联系客服
              </Link>
            </Button>

            <Button asChild variant="ghost" size="sm">
              <Link href="/docs">查看帮助文档</Link>
            </Button>
          </div>

          {/* FAQ */}
          <Card className="text-left">
            <CardHeader>
              <CardTitle className="text-lg">常见问题</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">
                    为什么支付被取消了？
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    支付可能因为网络问题、银行卡限制或您主动取消而中断。
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">
                    我的银行卡会被扣费吗？
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    不会，取消的支付不会产生任何费用。
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">
                    如何重新尝试支付？
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    您可以返回定价页面，重新选择会员计划进行支付。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

export const metadata = {
  title: '支付已取消',
  description: '支付已取消，没有产生任何费用',
}
