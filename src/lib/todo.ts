import { z } from 'zod'

export interface TodoItem {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

export type TodoFilter = 'all' | 'active' | 'completed'

export const TODO_STORAGE_KEY = 'ai-saas-template.todos'

const todoItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  completed: z.boolean(),
  createdAt: z.number().int().nonnegative(),
})

const todoItemsSchema = z.array(todoItemSchema)

function getBrowserStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

export function normalizeTodoTitle(title: string): string {
  return title.replace(/\s+/g, ' ').trim()
}

export function createTodo(
  title: string,
  options?: {
    id?: string
    createdAt?: number
  }
): TodoItem {
  return {
    id: options?.id ?? crypto.randomUUID(),
    title: normalizeTodoTitle(title),
    completed: false,
    createdAt: options?.createdAt ?? Date.now(),
  }
}

export function filterTodos(todos: TodoItem[], filter: TodoFilter): TodoItem[] {
  switch (filter) {
    case 'active':
      return todos.filter(todo => !todo.completed)
    case 'completed':
      return todos.filter(todo => todo.completed)
    default:
      return todos
  }
}

export function parseStoredTodos(rawValue: string | null): TodoItem[] {
  if (!rawValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(rawValue)
    return todoItemsSchema.parse(parsedValue)
  } catch {
    return []
  }
}

export function loadTodos(
  storage: Pick<Storage, 'getItem'> | null = getBrowserStorage()
): TodoItem[] {
  if (!storage) {
    return []
  }

  try {
    return parseStoredTodos(storage.getItem(TODO_STORAGE_KEY))
  } catch {
    return []
  }
}

export function saveTodos(
  todos: TodoItem[],
  storage: Pick<Storage, 'setItem'> | null = getBrowserStorage()
): void {
  if (!storage) {
    return
  }

  try {
    storage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos))
  } catch {
    // Swallow storage write failures so the UI remains usable.
  }
}
