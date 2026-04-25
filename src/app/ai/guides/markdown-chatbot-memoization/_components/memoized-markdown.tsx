import { memo, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'

function parseMarkdownIntoBlocks(markdown: string): string[] {
  return markdown.split(/\n\n+/).filter(block => block.trim().length > 0)
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return <ReactMarkdown>{content}</ReactMarkdown>
  },
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false
    return true
  }
)

MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock'

export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content])

    return blocks.map((block, index) => (
      <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
    ))
  }
)

MemoizedMarkdown.displayName = 'MemoizedMarkdown'
