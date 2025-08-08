'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Code, Eye, Monitor, Moon, Smartphone, Sun, Tablet } from 'lucide-react'
import { useTheme } from 'next-themes'

import type { ViewportSize } from '@/types/blocks'

interface ComponentPreviewToolbarProps {
  viewport: ViewportSize
  onViewportChange: (viewport: ViewportSize) => void
  showCode: boolean
  onShowCodeChange: (show: boolean) => void
}

const viewportConfig = {
  desktop: {
    icon: Monitor,
    label: 'Desktop',
    width: '100%',
  },
  tablet: {
    icon: Tablet,
    label: 'Tablet',
    width: '768px',
  },
  mobile: {
    icon: Smartphone,
    label: 'Mobile',
    width: '375px',
  },
}

export function ComponentPreviewToolbar({
  viewport,
  onViewportChange,
  showCode,
  onShowCodeChange,
}: ComponentPreviewToolbarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center justify-between border-b bg-background p-3">
      <div className="flex items-center gap-2">
        <TooltipProvider>
          {/* Responsive switch button */}
          <div className="flex items-center gap-1">
            {(Object.keys(viewportConfig) as ViewportSize[]).map(size => {
              const config = viewportConfig[size]
              const IconComponent = config.icon
              const isActive = viewport === size

              return (
                <Tooltip key={size}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onViewportChange(size)}
                      className="h-8 w-8 p-0"
                    >
                      <IconComponent className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{config.label}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </TooltipProvider>

        <Separator orientation="vertical" className="h-6" />

        {/* Theme switch button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="h-8 w-8 p-0"
              >
                <Sun className="dark:-rotate-90 h-4 w-4 rotate-0 scale-100 transition-all dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>切换主题</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Show code button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showCode ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onShowCodeChange(!showCode)}
              className="gap-2"
            >
              {showCode ? (
                <>
                  <Eye className="h-4 w-4" />
                  显示预览
                </>
              ) : (
                <>
                  <Code className="h-4 w-4" />
                  显示代码
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{showCode ? '切换到预览模式' : '查看组件代码'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
