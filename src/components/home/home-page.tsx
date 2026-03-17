import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-primary" />
            <span className="font-semibold tracking-wide">
              AI SaaS Template
            </span>
          </div>
          <Button variant="outline" size="sm">
            Dashboard
          </Button>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 md:py-24">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          默认模版基础样式
        </div>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          用最少代码，快速搭建你的 AI SaaS 首页
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          已包含主视觉区、功能卡片、基础按钮样式和页脚结构，方便你直接继续扩展业务页面。
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg">
            开始使用
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline">
            查看文档
          </Button>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-20 md:grid-cols-3">
        {[
          {
            title: '开箱可用',
            desc: '默认页面结构与基础视觉风格已经搭好。',
          },
          {
            title: '组件化扩展',
            desc: '基于 Button/Card 组件，便于继续叠加业务区块。',
          },
          {
            title: '构建可通过',
            desc: '当前样式和页面已通过 type-check 与 build 验证。',
          },
        ].map(item => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {item.desc}
            </CardContent>
          </Card>
        ))}
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        AI SaaS Template Base UI • Vite + React 19
      </footer>
    </main>
  )
}
