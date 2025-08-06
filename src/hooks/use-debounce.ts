import { useEffect, useState } from 'react'

/**
 * A custom Hook that debounces a given value.
 *
 * @template T The type of the value
 * @param {T} value The value to debounce
 * @param {number} delay The debounce delay time (in milliseconds)
 * @returns {T} The debounced value
 *
 * @example
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // Perform a search operation
 *   }
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set a timer to update the debounced value after the delay time
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clear the previous timer before the next effect runs or when the component unmounts
    // This ensures that the debouncedValue is only updated if the value hasn't changed within the delay time
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay]) // Only reset the timer if value or delay changes

  return debouncedValue
}
