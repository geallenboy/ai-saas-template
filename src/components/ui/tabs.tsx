'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as React from 'react'

import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // 基础样式
      'inline-flex items-center justify-center rounded-xl p-1.5',
      // 背景和边框
      'bg-gradient-to-r from-gray-100/80 via-gray-50/90 to-gray-100/80',
      'dark:from-gray-800/80 dark:via-gray-900/90 dark:to-gray-800/80',
      'border border-gray-200/60 dark:border-gray-700/60',
      'backdrop-blur-sm shadow-lg',
      // 移动端优化
      'w-full sm:w-auto overflow-x-auto scrollbar-none',
      'min-h-[44px]', // iOS触摸目标最小尺寸
      // 文本颜色
      'text-gray-600 dark:text-gray-400',
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // 基础布局
      'inline-flex items-center justify-center whitespace-nowrap rounded-lg',
      // 内边距 - 移动端优化
      'px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3',
      // 字体大小 - 响应式
      'text-sm sm:text-base font-medium',
      // 最小尺寸 - 移动端触摸友好
      'min-h-[40px] min-w-[60px] sm:min-h-[44px] sm:min-w-[80px]',
      // 过渡动效
      'transition-all duration-300 ease-out',
      // 聚焦样式
      'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      // 禁用状态
      'disabled:pointer-events-none disabled:opacity-50',
      // 默认状态
      'text-gray-600 dark:text-gray-400',
      'hover:text-gray-900 dark:hover:text-gray-200',
      'hover:bg-white/60 dark:hover:bg-gray-700/60',
      // 激活状态
      'data-[state=active]:bg-gradient-to-r data-[state=active]:from-white data-[state=active]:to-white/95',
      'dark:data-[state=active]:from-gray-700 dark:data-[state=active]:to-gray-700/95',
      'data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300',
      'data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20',
      'data-[state=active]:border-transparent',
      'data-[state=active]:font-semibold',
      // 激活状态的装饰效果
      'relative overflow-hidden',
      'data-[state=active]:before:absolute data-[state=active]:before:inset-0',
      'data-[state=active]:before:bg-gradient-to-r data-[state=active]:before:from-blue-50 data-[state=active]:before:to-purple-50',
      'dark:data-[state=active]:before:from-blue-950/30 dark:data-[state=active]:before:to-purple-950/30',
      'data-[state=active]:before:opacity-60 data-[state=active]:before:-z-10',
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      // 间距优化
      'mt-4 sm:mt-6 lg:mt-8',
      // 聚焦样式
      'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      // 动画
      'animate-in fade-in-50 duration-300',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
