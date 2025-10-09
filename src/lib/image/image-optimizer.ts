/**
 * 图片优化系统
 * 提供图片压缩、格式转换、懒加载和响应式图片功能
 */

import { logger } from '@/lib/logger'

// 图片优化配置
interface ImageOptimizationConfig {
  quality: number // 压缩质量 (0-1)
  maxWidth: number // 最大宽度
  maxHeight: number // 最大高度
  format: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto'
  progressive: boolean // 渐进式加载
  placeholder: boolean // 生成占位符
}

// 响应式图片配置
interface ResponsiveImageConfig {
  breakpoints: number[] // 断点宽度
  devicePixelRatio: number[] // 设备像素比
  formats: string[] // 支持的格式
}

// 图片元数据
interface ImageMetadata {
  width: number
  height: number
  format: string
  size: number
  aspectRatio: number
}

// 默认配置
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
   * 压缩图片
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
      // 获取图片元数据
      const originalMetadata = await this.getImageMetadata(file)

      // 创建图片元素
      const img = await this.createImageElement(file)

      // 计算目标尺寸
      const targetDimensions = this.calculateTargetDimensions(
        originalMetadata.width,
        originalMetadata.height,
        config.maxWidth,
        config.maxHeight
      )

      // 设置画布尺寸
      if (this.canvas && this.ctx) {
        this.canvas.width = targetDimensions.width
        this.canvas.height = targetDimensions.height

        // 绘制图片
        this.ctx.drawImage(
          img,
          0,
          0,
          targetDimensions.width,
          targetDimensions.height
        )

        // 转换为目标格式
        const targetFormat = this.getTargetFormat(config.format, file.type)
        const compressedBlob = await this.canvasToBlob(
          this.canvas,
          targetFormat,
          config.quality
        )

        // 创建压缩后的文件
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

      // 返回原始文件作为降级
      const metadata = await this.getImageMetadata(file)
      return {
        file,
        metadata,
        compressionRatio: 1,
      }
    }
  }

  /**
   * 生成响应式图片
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

      // 为每个断点和格式生成图片
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

      // 生成 srcSet 字符串
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
   * 生成图片占位符
   */
  async generatePlaceholder(file: File, size = 20): Promise<string> {
    try {
      const img = await this.createImageElement(file)

      if (this.canvas && this.ctx) {
        // 生成小尺寸占位符
        this.canvas.width = size
        this.canvas.height = size

        this.ctx.drawImage(img, 0, 0, size, size)

        // 应用模糊效果
        this.ctx.filter = 'blur(2px)'
        this.ctx.drawImage(this.canvas, 0, 0)

        // 转换为 base64
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

      // 返回默认占位符
      return this.getDefaultPlaceholder()
    }
  }

  /**
   * 获取图片元数据
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
   * 创建图片元素
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
   * 计算目标尺寸
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

    // 按宽度限制
    if (targetWidth > maxWidth) {
      targetWidth = maxWidth
      targetHeight = targetWidth / aspectRatio
    }

    // 按高度限制
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
   * 获取目标格式
   */
  private getTargetFormat(configFormat: string, originalType: string): string {
    if (configFormat === 'auto') {
      // 自动选择最佳格式
      if (this.isFormatSupported('avif')) return 'image/avif'
      if (this.isFormatSupported('webp')) return 'image/webp'
      return originalType
    }

    return `image/${configFormat}`
  }

  /**
   * 检查格式支持
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
   * Canvas 转 Blob
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
   * 获取优化后的文件名
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
   * 生成 srcSet 字符串
   */
  private generateSrcSet(
    images: { width: number; file: File; format: string }[]
  ): string {
    return images
      .map(img => `${URL.createObjectURL(img.file)} ${img.width}w`)
      .join(', ')
  }

  /**
   * 生成 sizes 字符串
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
   * 获取默认占位符
   */
  private getDefaultPlaceholder(): string {
    // 生成简单的 SVG 占位符
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

// 创建全局图片优化器实例
export const imageOptimizer = new ImageOptimizer()

// 懒加载观察器
export class LazyImageObserver {
  private observer: IntersectionObserver | null = null
  private images = new Set<HTMLImageElement>()

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: '50px 0px', // 提前50px开始加载
          threshold: 0.01,
        }
      )
    }
  }

  /**
   * 观察图片元素
   */
  observe(img: HTMLImageElement): void {
    if (this.observer) {
      this.images.add(img)
      this.observer.observe(img)
    }
  }

  /**
   * 停止观察图片元素
   */
  unobserve(img: HTMLImageElement): void {
    if (this.observer) {
      this.images.delete(img)
      this.observer.unobserve(img)
    }
  }

  /**
   * 处理交叉事件
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
   * 加载图片
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
   * 销毁观察器
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.images.clear()
    }
  }
}

// 创建全局懒加载观察器
export const lazyImageObserver = new LazyImageObserver()
