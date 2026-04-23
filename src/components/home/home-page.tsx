import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
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
          <Button asChild variant="outline" size="sm">
            <Link to="/todo">Todo List</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 md:py-24">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          现在包含一个可用的 Todo List 功能页
        </div>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          在现有模板里，直接开始管理你的任务流
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          新增了一个本地持久化的 Todo List
          页面，支持新增、筛选、完成、删除和清理已完成任务。
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/todo">
              打开 Todo List
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/todo">查看任务面板</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-20 md:grid-cols-3">
        {[
          {
            title: '本地自动保存',
            desc: '任务列表会持久化到浏览器，刷新页面后仍然保留。',
          },
          {
            title: '状态一目了然',
            desc: '支持全部、进行中、已完成筛选和完成率展示。',
          },
          {
            title: '继续扩展很方便',
            desc: '当前实现基于独立组件和纯函数工具，后续可接 API 或数据库。',
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
