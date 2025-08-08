/**
 * Image optimization system
 * Provides image compression, format conversion, lazy loading, and responsive image features
 */

import { logger } from '@/lib/logger'

// Image optimization configuration
interface ImageOptimizationConfig {
  quality: number // Compression quality (0-1)
  maxWidth: number // Maximum width
  maxHeight: number // Maximum height
  format: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto'
  progressive: boolean // Progressive loading
  placeholder: boolean // Generate placeholder
}

// Responsive image configuration
interface ResponsiveImageConfig {
  breakpoints: number[] // Breakpoint widths
  devicePixelRatio: number[] // Device pixel ratios
  formats: string[] // Supported formats
}

// Image metadata
interface ImageMetadata {
  width: number
  height: number
  format: string
  size: number
  aspectRatio: number
}

// Default configuration
const DEFAULT_CONFIG: ImageOptimizationConfig = {
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080,
  format: 'auto',
  progressive: true,
  placeholder: true,
}

const RESPONSIVE_CONFIG: ResponsiveImageConfig = {
  breakpoints: [640, 768, 1024, 1280, 1536],
  devicePixelRatio: [1, 2],
  formats: ['avif', 'webp', 'jpeg'],
}

export class ImageOptimizer {
  private config: ImageOptimizationConfig
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  constructor(config: Partial<ImageOptimizationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }

    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')
    }
  }

  /**
   * Compress image
   */
  async compressImage(
    file: File,
    options: Partial<ImageOptimizationConfig> = {}
  ): Promise<{
    file: File
    metadata: ImageMetadata
    compressionRatio: number
  }> {
    const startTime = Date.now()
    const config = { ...this.config, ...options }

    try {
      // Get image metadata
      const originalMetadata = await this.getImageMetadata(file)

      // Create image element
      const img = await this.createImageElement(file)

      // Calculate target dimensions
      const targetDimensions = this.calculateTargetDimensions(
        originalMetadata.width,
        originalMetadata.height,
        config.maxWidth,
        config.maxHeight
      )

      // Set canvas dimensions
      if (this.canvas && this.ctx) {
        this.canvas.width = targetDimensions.width
        this.canvas.height = targetDimensions.height

        // Draw image
        this.ctx.drawImage(
          img,
          0,
          0,
          targetDimensions.width,
          targetDimensions.height
        )

        // Convert to target format
        const targetFormat = this.getTargetFormat(config.format, file.type)
        const compressedBlob = await this.canvasToBlob(
          this.canvas,
          targetFormat,
          config.quality
        )

        // Create compressed file
        const compressedFile = new File(
          [compressedBlob],
          this.getOptimizedFileName(file.name, targetFormat),
          { type: compressedBlob.type }
        )

        const compressedMetadata = await this.getImageMetadata(compressedFile)
        const compressionRatio = originalMetadata.size / compressedMetadata.size

        logger.info('Image compressed successfully', {
          category: 'performance',
          originalSize: originalMetadata.size,
          compressedSize: compressedMetadata.size,
          compressionRatio,
          duration: Date.now() - startTime,
        })

        return {
          file: compressedFile,
          metadata: compressedMetadata,
          compressionRatio,
        }
      }

      throw new Error('Canvas not available')
    } catch (error) {
      logger.error('Image compression failed', error as Error, {
        category: 'performance',
        fileName: file.name,
        fileSize: file.size,
      })

      // Return original file as fallback
      const metadata = await this.getImageMetadata(file)
      return {
        file,
        metadata,
        compressionRatio: 1,
      }
    }
  }

  /**
   * Generate responsive images
   */
  async generateResponsiveImages(
    file: File,
    config: Partial<ResponsiveImageConfig> = {}
  ): Promise<{
    images: { width: number; file: File; format: string }[]
    srcSet: string
    sizes: string
  }> {
    const responsiveConfig = { ...RESPONSIVE_CONFIG, ...config }
    const images: { width: number; file: File; format: string }[] = []

    try {
      const originalMetadata = await this.getImageMetadata(file)

      // Generate images for each breakpoint and format
      for (const width of responsiveConfig.breakpoints) {
        if (width <= originalMetadata.width) {
          for (const format of responsiveConfig.formats) {
            if (this.isFormatSupported(format)) {
              const optimizedResult = await this.compressImage(file, {
                maxWidth: width,
                format: format as any,
                quality: 0.8,
              })

              images.push({
                width,
                file: optimizedResult.file,
                format,
              })
            }
          }
        }
      }

      // Generate srcSet string
      const srcSet = this.generateSrcSet(images)
      const sizes = this.generateSizes(responsiveConfig.breakpoints)

      logger.info('Responsive images generated', {
        category: 'performance',
        imageCount: images.length,
        breakpoints: responsiveConfig.breakpoints,
      })

      return { images, srcSet, sizes }
    } catch (error) {
      logger.error('Responsive image generation failed', error as Error, {
        category: 'performance',
        fileName: file.name,
      })

      return { images: [], srcSet: '', sizes: '' }
    }
  }

  /**
   * Generate image placeholder
   */
  async generatePlaceholder(file: File, size = 20): Promise<string> {
    try {
      const img = await this.createImageElement(file)

      if (this.canvas && this.ctx) {
        // Generate small placeholder
        this.canvas.width = size
        this.canvas.height = size

        this.ctx.drawImage(img, 0, 0, size, size)

        // Apply blur effect
        this.ctx.filter = 'blur(2px)'
        this.ctx.drawImage(this.canvas, 0, 0)

        // Convert to base64
        const placeholder = this.canvas.toDataURL('image/jpeg', 0.1)

        logger.debug('Placeholder generated', {
          category: 'performance',
          size,
          placeholderSize: placeholder.length,
        })

        return placeholder
      }

      throw new Error('Canvas not available')
    } catch (error) {
      logger.error('Placeholder generation failed', error as Error, {
        category: 'performance',
        fileName: file.name,
      })

      // Return default placeholder
      return this.getDefaultPlaceholder()
    }
  }

  /**
   * Get image metadata
   */
  private async getImageMetadata(file: File): Promise<ImageMetadata> {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          format: file.type,
          size: file.size,
          aspectRatio: img.naturalWidth / img.naturalHeight,
        })
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Create image element
   */
  private async createImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        URL.revokeObjectURL(img.src)
        resolve(img)
      }

      img.onerror = () => {
        URL.revokeObjectURL(img.src)
        reject(new Error('Failed to create image element'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Calculate target dimensions
   */
  private calculateTargetDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight

    let targetWidth = originalWidth
    let targetHeight = originalHeight

    // Limit by width
    if (targetWidth > maxWidth) {
      targetWidth = maxWidth
      targetHeight = targetWidth / aspectRatio
    }

    // Limit by height
    if (targetHeight > maxHeight) {
      targetHeight = maxHeight
      targetWidth = targetHeight * aspectRatio
    }

    return {
      width: Math.round(targetWidth),
      height: Math.round(targetHeight),
    }
  }

  /**
   * Get target format
   */
  private getTargetFormat(configFormat: string, originalType: string): string {
    if (configFormat === 'auto') {
      // Automatically select best format
      if (this.isFormatSupported('avif')) return 'image/avif'
      if (this.isFormatSupported('webp')) return 'image/webp'
      return originalType
    }

    return `image/${configFormat}`
  }

  /**
   * Check format support
   */
  private isFormatSupported(format: string): boolean {
    if (typeof window === 'undefined') return false

    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1

    try {
      const dataUrl = canvas.toDataURL(`image/${format}`)
      return dataUrl.startsWith(`data:image/${format}`)
    } catch {
      return false
    }
  }

  /**
   * Canvas to Blob
   */
  private canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string,
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to convert canvas to blob'))
          }
        },
        type,
        quality
      )
    })
  }

  /**
   * Get optimized file name
   */
  private getOptimizedFileName(
    originalName: string,
    targetFormat: string
  ): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
    const extension = targetFormat.split('/')[1]
    return `${nameWithoutExt}_optimized.${extension}`
  }

  /**
   * Generate srcSet string
   */
  private generateSrcSet(
    images: { width: number; file: File; format: string }[]
  ): string {
    return images
      .map(img => `${URL.createObjectURL(img.file)} ${img.width}w`)
      .join(', ')
  }

  /**
   * Generate sizes string
   */
  private generateSizes(breakpoints: number[]): string {
    return breakpoints
      .map((bp, index) => {
        if (index === breakpoints.length - 1) {
          return `${bp}px`
        }
        return `(max-width: ${bp}px) ${bp}px`
      })
      .join(', ')
  }

  /**
   * Get default placeholder
   */
  private getDefaultPlaceholder(): string {
    // Generate simple SVG placeholder
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">
          Loading...
        </text>
      </svg>
    `

    return `data:image/svg+xml;base64,${btoa(svg)}`
  }
}

// Create global image optimizer instance
export const imageOptimizer = new ImageOptimizer()

// Lazy loading observer
export class LazyImageObserver {
  private observer: IntersectionObserver | null = null
  private images = new Set<HTMLImageElement>()

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: '50px 0px', // Start loading 50px early
          threshold: 0.01,
        }
      )
    }
  }

  /**
   * Observe image element
   */
  observe(img: HTMLImageElement): void {
    if (this.observer) {
      this.images.add(img)
      this.observer.observe(img)
    }
  }

  /**
   * Unobserve image element
   */
  unobserve(img: HTMLImageElement): void {
    if (this.observer) {
      this.images.delete(img)
      this.observer.unobserve(img)
    }
  }

  /**
   * Handle intersection events
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        this.loadImage(img)
        this.unobserve(img)
      }
    })
  }

  /**
   * Load image
   */
  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src
    const srcset = img.dataset.srcset

    if (src) {
      img.src = src
      img.removeAttribute('data-src')
    }

    if (srcset) {
      img.srcset = srcset
      img.removeAttribute('data-srcset')
    }

    img.classList.remove('lazy-loading')
    img.classList.add('lazy-loaded')

    logger.debug('Lazy image loaded', {
      category: 'performance',
      src: src || srcset,
    })
  }

  /**
   * Destroy observer
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.images.clear()
    }
  }
}

// Create global lazy loading observer
export const lazyImageObserver = new LazyImageObserver()
