import * as React from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const ResponsiveContainer = React.forwardRef<
  HTMLDivElement,
  ResponsiveContainerProps
>(({ className, size = 'lg', padding = 'md', children, ...props }, ref) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  }

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-2 sm:px-6 sm:py-4',
    md: 'px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8',
    lg: 'px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12',
    xl: 'px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16',
  }

  return (
    <div
      ref={ref}
      className={cn(
        'mx-auto w-full',
        sizeClasses[size],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
ResponsiveContainer.displayName = 'ResponsiveContainer'

export { ResponsiveContainer }
