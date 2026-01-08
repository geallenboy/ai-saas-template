'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Components } from 'react-markdown'

interface MarkdownContentProps {
  content: string
  className?: string
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : ''
      const isInline = !language && !String(children).includes('\n')

      return !isInline && language ? (
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          className="rounded-md"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
          {...props}
        >
          {children}
        </code>
      )
    },
    h1({ children }) {
      return (
        <h1 className="mb-4 mt-8 scroll-m-20 text-4xl font-bold tracking-tight first:mt-0">
          {children}
        </h1>
      )
    },
    h2({ children }) {
      return (
        <h2 className="mb-4 mt-8 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          {children}
        </h2>
      )
    },
    h3({ children }) {
      return (
        <h3 className="mb-4 mt-6 scroll-m-20 text-2xl font-semibold tracking-tight">
          {children}
        </h3>
      )
    },
    h4({ children }) {
      return (
        <h4 className="mb-2 mt-6 scroll-m-20 text-xl font-semibold tracking-tight">
          {children}
        </h4>
      )
    },
    h5({ children }) {
      return (
        <h5 className="mb-2 mt-4 scroll-m-20 text-lg font-semibold tracking-tight">
          {children}
        </h5>
      )
    },
    h6({ children }) {
      return (
        <h6 className="mb-2 mt-4 scroll-m-20 text-base font-semibold tracking-tight">
          {children}
        </h6>
      )
    },
    p({ children }) {
      return (
        <p className="mb-4 leading-7 [&:not(:first-child)]:mt-4">{children}</p>
      )
    },
    ul({ children }) {
      return <ul className="mb-4 ml-6 list-disc [&>li]:mt-2">{children}</ul>
    },
    ol({ children }) {
      return <ol className="mb-4 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
    },
    li({ children }) {
      return <li className="leading-7">{children}</li>
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-muted-foreground/40 mb-4 mt-6 border-l-4 pl-4 italic text-muted-foreground">
          {children}
        </blockquote>
      )
    },
    table({ children }) {
      return (
        <div className="mb-4 w-full overflow-auto">
          <table className="w-full border-collapse border border-border">
            {children}
          </table>
        </div>
      )
    },
    thead({ children }) {
      return <thead className="bg-muted/50">{children}</thead>
    },
    tbody({ children }) {
      return <tbody>{children}</tbody>
    },
    tr({ children }) {
      return <tr className="border-b border-border">{children}</tr>
    },
    th({ children }) {
      return (
        <th className="border border-border px-4 py-2 text-left font-semibold">
          {children}
        </th>
      )
    },
    td({ children }) {
      return <td className="border border-border px-4 py-2">{children}</td>
    },
    a({ href, children }) {
      return (
        <a
          href={href}
          className="text-primary underline-offset-4 hover:underline"
          target={href?.startsWith('http') ? '_blank' : undefined}
          rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      )
    },
    hr() {
      return <hr className="my-8 border-border" />
    },
    img({ src, alt }) {
      return (
        <img
          src={src}
          alt={alt || ''}
          className="mb-4 mt-6 rounded-lg border border-border"
          loading="lazy"
        />
      )
    },
    strong({ children }) {
      return <strong className="font-semibold">{children}</strong>
    },
    em({ children }) {
      return <em className="italic">{children}</em>
    },
  }

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
