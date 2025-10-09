import { useEffect, useState } from 'react'

/**
 * 一个自定义 Hook，用于对给定的值进行防抖处理。
 *
 * @template T 值的类型
 * @param {T} value 需要进行防抖处理的值
 * @param {number} delay 防抖延迟时间（毫秒）
 * @returns {T} 经过防抖处理后的值
 *
 * @example
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // 执行搜索操作
 *   }
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // 设置一个定时器，在延迟时间后更新防抖值
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // 在下一次 effect 执行前或组件卸载时，清除上一个定时器
    // 这确保了只有当 value 在 delay 时间内没有变化时，才会更新 debouncedValue
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay]) // 仅当 value 或 delay 变化时，才重新设置定时器

  return debouncedValue
}
