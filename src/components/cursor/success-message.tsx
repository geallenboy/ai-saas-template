'use client'

import { CheckCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface SuccessMessageProps {
  isVisible: boolean
  message?: string
  duration?: number
  onComplete?: () => void
  className?: string
}

/**
 * 成功消息组件
 * 用于显示操作成功的反馈
 */
export function SuccessMessage({
  isVisible,
  message = '操作成功！',
  duration = 2000,
  onComplete,
  className,
}: SuccessMessageProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShow(true)

      if (duration > 0) {
        const timer = setTimeout(() => {
          setShow(false)
          onComplete?.()
        }, duration)

        return () => clearTimeout(timer)
      }
    } else {
      setShow(false)
    }

    return undefined
  }, [isVisible, duration, onComplete])

  if (!show) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 animate-in fade-in-0 zoom-in-95 duration-300">
        <CheckCircle className="h-12 w-12 text-green-600" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 text-center">
          {message}
        </p>
        {duration > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {Math.ceil(duration / 1000)} 秒后自动跳转...
          </p>
        )}
      </div>
    </div>
  )
}
