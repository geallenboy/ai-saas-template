'use client'

import { CheckIcon, CopyIcon } from 'lucide-react'
import type { ComponentProps, HTMLAttributes, ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { codeToHtml } from 'shiki'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CodeBlockContextType {
  code: string
}

const CodeBlockContext = createContext<CodeBlockContextType>({
  code: '',
})

export type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string
  language: string
  showLineNumbers?: boolean
  children?: ReactNode
}

export const CodeBlock = ({
  code,
  language,
  showLineNumbers = false,
  className,
  children,
  ...props
}: CodeBlockProps) => {
  const [lightHtml, setLightHtml] = useState<string>('')
  const [darkHtml, setDarkHtml] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    const highlight = async () => {
      try {
        const [light, dark] = await Promise.all([
          codeToHtml(code, { lang: language, theme: 'one-light' }),
          codeToHtml(code, { lang: language, theme: 'one-dark-pro' }),
        ])
        if (!cancelled) {
          setLightHtml(light)
          setDarkHtml(dark)
        }
      } catch {
        const escaped = code
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        const fallback = `<pre style="margin:0;padding:1rem;font-size:0.875rem"><code class="font-mono text-sm">${escaped}</code></pre>`
        if (!cancelled) {
          setLightHtml(fallback)
          setDarkHtml(fallback)
        }
      }
    }

    highlight()
    return () => {
      cancelled = true
    }
  }, [code, language])

  return (
    <CodeBlockContext.Provider value={{ code }}>
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-md border bg-background text-foreground',
          className
        )}
        {...props}
      >
        <div className="relative">
          <div
            className="overflow-hidden [&_pre]:m-0! [&_pre]:p-4! [&_pre]:text-sm! [&_pre]:bg-[hsl(var(--background))]! [&_code]:font-mono [&_code]:text-sm dark:hidden"
            dangerouslySetInnerHTML={{ __html: lightHtml }}
          />
          <div
            className="hidden overflow-hidden [&_pre]:m-0! [&_pre]:p-4! [&_pre]:text-sm! [&_pre]:bg-[hsl(var(--background))]! [&_code]:font-mono [&_code]:text-sm dark:block"
            dangerouslySetInnerHTML={{ __html: darkHtml }}
          />
          {children && (
            <div className="absolute top-2 right-2 flex items-center gap-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </CodeBlockContext.Provider>
  )
}

export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void
  onError?: (error: Error) => void
  timeout?: number
}

export const CodeBlockCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: CodeBlockCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false)
  const { code } = useContext(CodeBlockContext)

  const copyToClipboard = async () => {
    if (typeof window === 'undefined' || !navigator.clipboard?.writeText) {
      onError?.(new Error('Clipboard API not available'))
      return
    }

    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)
      onCopy?.()
      setTimeout(() => setIsCopied(false), timeout)
    } catch (error) {
      onError?.(error as Error)
    }
  }

  const Icon = isCopied ? CheckIcon : CopyIcon

  return (
    <Button
      className={cn('shrink-0', className)}
      onClick={copyToClipboard}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon size={14} />}
    </Button>
  )
}
