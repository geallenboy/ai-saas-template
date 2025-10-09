import type { Experimental_GeneratedImage } from 'ai'
import NextImage, { type ImageProps as NextImageProps } from 'next/image'
import { cn } from '@/lib/utils'

export type ImageProps = Experimental_GeneratedImage &
  Omit<NextImageProps, 'src' | 'alt'> & {
    className?: string
    alt?: string
  }

export const Image = ({
  base64,
  uint8Array: _uint8Array,
  mediaType,
  className,
  alt,
  width,
  height,
  fill,
  unoptimized = true,
  ...props
}: ImageProps) => {
  const resolvedWidth = width ?? (fill ? undefined : 1024)
  const resolvedHeight = height ?? (fill ? undefined : 1024)

  return (
    <NextImage
      {...props}
      alt={alt ?? 'Generated image'}
      className={cn('h-auto max-w-full overflow-hidden rounded-md', className)}
      fill={fill}
      height={fill ? undefined : resolvedHeight}
      src={`data:${mediaType};base64,${base64}`}
      unoptimized={unoptimized}
      width={fill ? undefined : resolvedWidth}
    />
  )
}
