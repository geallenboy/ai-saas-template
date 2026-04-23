import { describe, expect, it } from 'vitest'
import {
  createTodo,
  filterTodos,
  normalizeTodoTitle,
  parseStoredTodos,
} from '@/lib/todo'

describe('normalizeTodoTitle', () => {
  it('trims and collapses extra whitespace', () => {
    expect(normalizeTodoTitle('  写   一份   周报  ')).toBe('写 一份 周报')
  })
})

describe('createTodo', () => {
  it('creates a normalized todo item', () => {
    const todo = createTodo('  准备 demo  ', {
      id: 'todo-1',
      createdAt: 1742400000000,
    })

    expect(todo).toEqual({
      id: 'todo-1',
      title: '准备 demo',
      completed: false,
      createdAt: 1742400000000,
    })
  })
})

describe('filterTodos', () => {
  const todos = [
    {
      id: '1',
      title: '写首页',
      completed: false,
      createdAt: 1,
    },
    {
      id: '2',
      title: '接入登录',
      completed: true,
      createdAt: 2,
    },
  ]

  it('returns only active todos for the active filter', () => {
    expect(filterTodos(todos, 'active')).toEqual([todos[0]])
  })

  it('returns only completed todos for the completed filter', () => {
    expect(filterTodos(todos, 'completed')).toEqual([todos[1]])
  })
})

describe('parseStoredTodos', () => {
  it('returns an empty list for malformed storage data', () => {
    expect(parseStoredTodos('{"broken": true}')).toEqual([])
    expect(parseStoredTodos('not-json')).toEqual([])
  })

  it('returns validated todos for valid storage data', () => {
    const serialized = JSON.stringify([
      {
        id: 'todo-1',
        title: '发布版本',
        completed: false,
        createdAt: 1742400000000,
      },
    ])

    expect(parseStoredTodos(serialized)).toEqual([
      {
        id: 'todo-1',
        title: '发布版本',
        completed: false,
        createdAt: 1742400000000,
      },
    ])
  })
})
