import {
  Check,
  ChevronRight,
  Home,
  ListTodo,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  createTodo,
  filterTodos,
  loadTodos,
  normalizeTodoTitle,
  saveTodos,
  type TodoFilter,
  type TodoItem,
} from '@/lib/todo'
import { cn } from '@/lib/utils'

const filters: Array<{
  value: TodoFilter
  label: string
}> = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '进行中' },
  { value: 'completed', label: '已完成' },
]

function formatCreatedAt(timestamp: number): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

export function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>(() => loadTodos())
  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState<TodoFilter>('all')
  const [error, setError] = useState('')

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  const visibleTodos = filterTodos(todos, filter)
  const completedCount = todos.filter(todo => todo.completed).length
  const activeCount = todos.length - completedCount
  const completionRate =
    todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100)
  const todayLabel = new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date())

  function handleAddTodo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedTitle = normalizeTodoTitle(draft)

    if (!normalizedTitle) {
      setError('先写下一件要完成的事。')
      return
    }

    if (normalizedTitle.length > 120) {
      setError('任务内容请控制在 120 个字符内。')
      return
    }

    setTodos(currentTodos => [createTodo(normalizedTitle), ...currentTodos])
    setDraft('')
    setError('')
  }

  function handleToggleTodo(todoId: string) {
    setTodos(currentTodos =>
      currentTodos.map(todo =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  function handleDeleteTodo(todoId: string) {
    setTodos(currentTodos => currentTodos.filter(todo => todo.id !== todoId))
  }

  function handleClearCompleted() {
    setTodos(currentTodos => currentTodos.filter(todo => !todo.completed))
  }

  function handleToggleAll() {
    const shouldCompleteAll = activeCount > 0

    setTodos(currentTodos =>
      currentTodos.map(todo => ({
        ...todo,
        completed: shouldCompleteAll,
      }))
    )
  }

  function getFilterCount(currentFilter: TodoFilter): number {
    return filterTodos(todos, currentFilter).length
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_30%),radial-gradient(circle_at_80%_18%,_rgba(245,158,11,0.18),_transparent_30%),linear-gradient(180deg,_#f5efe4_0%,_#f8fafc_100%)] text-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-6rem] top-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute right-[-4rem] top-32 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-emerald-200/20 blur-3xl" />
      </div>

      <header className="relative border-b border-black/5 bg-white/55 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1.25rem] bg-slate-950 text-white shadow-lg shadow-slate-950/10">
              <ListTodo className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                Focus board
              </p>
              <h1 className="text-lg font-semibold tracking-tight">
                Todo List
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 md:block">
              自动保存在当前浏览器
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              <Link to="/">
                <Home className="h-4 w-4" />
                返回首页
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1.45fr)_360px]">
        <section className="space-y-6">
          <Card className="overflow-hidden rounded-[2rem] border-black/5 bg-white/75 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
            <CardContent className="grid gap-8 p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-sm text-slate-600">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  {todayLabel}
                </div>
                <div className="space-y-3">
                  <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                    把任务收进一个真正能推进进度的清单。
                  </h2>
                  <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                    记录、筛选、完成和清理你的待办事项。所有数据都保存在当前浏览器，刷新后不会丢。
                  </p>
                </div>
              </div>

              <div className="grid min-w-[220px] gap-3">
                <div className="rounded-[1.5rem] border border-black/5 bg-slate-950 p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                    Today
                  </p>
                  <p className="mt-3 text-3xl font-semibold">{activeCount}</p>
                  <p className="mt-1 text-sm text-white/70">件任务待推进</p>
                </div>
                <div className="rounded-[1.5rem] border border-black/5 bg-amber-100/90 p-4 text-slate-900">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Done rate
                  </p>
                  <p className="mt-3 text-3xl font-semibold">
                    {completionRate}%
                  </p>
                  <p className="mt-1 text-sm text-slate-600">当前清单完成率</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-black/5 bg-white/80 shadow-[0_16px_60px_-36px_rgba(15,23,42,0.45)] backdrop-blur">
            <CardHeader className="gap-3">
              <CardTitle className="text-2xl tracking-tight">
                新建任务
              </CardTitle>
              <CardDescription>
                用一句明确的话描述下一步，尽量让它能直接开做。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
                onSubmit={handleAddTodo}
              >
                <label className="sr-only" htmlFor="todo-title">
                  Todo 标题
                </label>
                <input
                  id="todo-title"
                  value={draft}
                  onChange={event => {
                    setDraft(event.target.value)
                    if (error) {
                      setError('')
                    }
                  }}
                  maxLength={140}
                  placeholder="例如：整理定价页文案并发给设计 review"
                  className="h-14 rounded-[1.25rem] border border-black/10 bg-stone-50 px-4 text-base text-slate-950 shadow-inner outline-none transition focus:border-slate-950/25 focus:bg-white focus:ring-4 focus:ring-cyan-500/15"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 rounded-[1.25rem] bg-slate-950 px-6 hover:bg-slate-800"
                >
                  添加任务
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="flex flex-wrap items-center gap-3">
                {filters.map(option => {
                  const isActive = filter === option.value

                  return (
                    <Button
                      key={option.value}
                      type="button"
                      size="sm"
                      variant={isActive ? 'default' : 'outline'}
                      onClick={() => setFilter(option.value)}
                      className={cn(
                        'rounded-full px-4',
                        isActive
                          ? 'bg-slate-950 hover:bg-slate-800'
                          : 'border-black/10 bg-white/70 text-slate-700 hover:bg-white'
                      )}
                    >
                      {option.label}
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs',
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'bg-slate-950/5 text-slate-500'
                        )}
                      >
                        {getFilterCount(option.value)}
                      </span>
                    </Button>
                  )
                })}

                {completedCount > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCompleted}
                    className="rounded-full text-slate-500 hover:bg-red-500/10 hover:text-red-600"
                  >
                    清除已完成
                  </Button>
                ) : null}
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </CardContent>
          </Card>

          <div className="space-y-3">
            {visibleTodos.length > 0 ? (
              visibleTodos.map(todo => (
                <article
                  key={todo.id}
                  className="group rounded-[1.75rem] border border-black/5 bg-white/85 p-4 shadow-[0_14px_40px_-28px_rgba(15,23,42,0.4)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.32)]"
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => handleToggleTodo(todo.id)}
                      aria-label={
                        todo.completed ? '标记为未完成' : '标记为已完成'
                      }
                      className={cn(
                        'mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border transition',
                        todo.completed
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          : 'border-black/10 bg-stone-100 text-slate-400 hover:border-slate-950/20 hover:text-slate-700'
                      )}
                    >
                      <Check className="h-5 w-5" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <p
                            className={cn(
                              'text-lg font-medium tracking-tight text-slate-950',
                              todo.completed && 'text-slate-400 line-through'
                            )}
                          >
                            {todo.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                            <span className="rounded-full bg-slate-950/5 px-2.5 py-1">
                              创建于 {formatCreatedAt(todo.createdAt)}
                            </span>
                            <span
                              className={cn(
                                'rounded-full px-2.5 py-1',
                                todo.completed
                                  ? 'bg-emerald-500/10 text-emerald-700'
                                  : 'bg-amber-500/10 text-amber-700'
                              )}
                            >
                              {todo.completed ? '已完成' : '进行中'}
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="rounded-full text-slate-400 hover:bg-red-500/10 hover:text-red-600"
                          aria-label="删除任务"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <Card className="rounded-[1.75rem] border-dashed border-black/10 bg-white/65 backdrop-blur">
                <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white">
                    <Target className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold tracking-tight">
                      {todos.length === 0
                        ? '还没有任务'
                        : filter === 'completed'
                          ? '还没有已完成的任务'
                          : '当前没有进行中的任务'}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {todos.length === 0
                        ? '先添加一条任务，让这个面板开始工作。'
                        : '切换筛选条件，或者继续新增下一项工作。'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <Card className="rounded-[2rem] border-black/5 bg-slate-950 text-white shadow-[0_24px_80px_-34px_rgba(15,23,42,0.75)]">
            <CardHeader>
              <CardTitle className="text-2xl tracking-tight">
                进度概览
              </CardTitle>
              <CardDescription className="text-white/65">
                用最少的指标看清清单状态。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>完成度</span>
                  <span>{completionRate}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-[width]"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[1.25rem] bg-white/6 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                    Active
                  </p>
                  <p className="mt-3 text-3xl font-semibold">{activeCount}</p>
                </div>
                <div className="rounded-[1.25rem] bg-white/6 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                    Done
                  </p>
                  <p className="mt-3 text-3xl font-semibold">
                    {completedCount}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={handleToggleAll}
                disabled={todos.length === 0}
                className="w-full rounded-[1rem] bg-white text-slate-950 hover:bg-white/90"
              >
                {activeCount > 0 ? '全部标记完成' : '全部恢复未完成'}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-black/5 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl tracking-tight">
                使用建议
              </CardTitle>
              <CardDescription>
                让待办列表保持轻量，才更容易真正执行。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
              <p>任务标题尽量写成“动词 + 对象”，例如“整理定价页 FAQ”。</p>
              <p>完成后及时清理已完成项，避免列表越积越厚。</p>
              <p>如果一项任务太大，拆成 2 到 3 个能当天推进的小步骤。</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  )
}
