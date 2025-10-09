/**
 * 图片上传工具函数
 * 支持文件上传和URL上传到Cloudflare Images
 */

/**
 * 获取API的完整URL
 * @param path - API路径
 * @returns 完整的API URL
 */
function getApiUrl(path: string): string {
  // 在客户端，使用当前域名
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`
  }

  // 在服务器端，必须使用完整URL
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000')

  return `${baseUrl}${path}`
}

export interface ImageUploadResult {
  success: boolean
  data?: {
    id: string
    url: string
    variants: string[]
    filename: string
  }
  error?: string
  details?: any
}

/**
 * 上传文件到服务器
 * @param file - 要上传的文件
 * @returns Promise<ImageUploadResult>
 */
export async function uploadImageFile(file: File): Promise<ImageUploadResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(getApiUrl('/api/upload/image'), {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Upload failed',
        details: result.details,
      }
    }

    return result
  } catch (error) {
    console.error('File upload failed:', error, {
      category: 'upload',
      fileSize: file?.size,
      fileType: file?.type,
      fileName: file?.name,
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * 通过URL上传图片到服务器
 * @param url - 图片URL
 * @param filename - 可选的文件名
 * @returns Promise<ImageUploadResult>
 */
export async function uploadImageFromUrl(
  url: string,
  filename?: string
): Promise<ImageUploadResult> {
  try {
    const apiUrl = getApiUrl('/api/upload/image')

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, filename }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Upload failed',
        details: result.details,
      }
    }

    return result
  } catch (error) {
    const { logger } = require('@/lib/logger')
    logger.error('URL upload failed', error as Error, {
      category: 'upload',
      url: url.substring(0, 100), // 限制URL长度避免日志过长
      action: 'url_upload',
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * 获取图片信息
 * @param imageId - 图片ID
 * @returns Promise<ImageUploadResult>
 */
export async function getImageInfo(
  imageId: string
): Promise<ImageUploadResult> {
  try {
    const response = await fetch(
      getApiUrl(`/api/upload/image?id=${encodeURIComponent(imageId)}`)
    )
    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to get image info',
        details: result.details,
      }
    }

    return result
  } catch (error) {
    const { logger } = require('@/lib/logger')
    logger.error('Failed to get image info', error as Error, {
      category: 'upload',
      imageId: imageId.substring(0, 100),
      action: 'get_image_info',
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * 验证文件是否为有效的图片
 * @param file - 要验证的文件
 * @returns 验证结果
 */
export function validateImageFile(file: File): {
  isValid: boolean
  error?: string
} {
  // 验证文件类型
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
  ]
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error:
        'Invalid file type. Only images (JPEG, PNG, GIF, WebP, BMP) are allowed.',
    }
  }

  // 验证文件大小 (最大 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size too large. Maximum size is 10MB.',
    }
  }

  return { isValid: true }
}

/**
 * 验证URL是否为有效的图片URL
 * @param url - 要验证的URL
 * @returns 验证结果
 */
export function validateImageUrl(url: string): {
  isValid: boolean
  error?: string
} {
  try {
    const parsedUrl = new URL(url)

    // 检查协议
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        isValid: false,
        error: 'Invalid URL protocol. Only HTTP and HTTPS are allowed.',
      }
    }

    // 检查文件扩展名（可选）
    const pathname = parsedUrl.pathname.toLowerCase()
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
    const hasImageExtension = imageExtensions.some(ext =>
      pathname.endsWith(ext)
    )

    // 如果URL中没有明显的图片扩展名，给出警告但仍然允许
    if (!hasImageExtension) {
      const { logger } = require('@/lib/logger')
      logger.warn('URL may not be an image', {
        category: 'upload',
        url: url.substring(0, 100),
        action: 'validate_image_url',
        hasImageExtension: false,
      })
    }

    return { isValid: true }
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format.',
    }
  }
}

/**
 * 将文件转换为Data URL用于预览
 * @param file - 要转换的文件
 * @returns Promise<string>
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * 压缩图片（如果需要）
 * @param file - 原始文件
 * @param maxWidth - 最大宽度
 * @param maxHeight - 最大高度
 * @param quality - 压缩质量 (0-1)
 * @returns Promise<File>
 */
export function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // 计算新的尺寸
      let { width, height } = img

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height

      // 绘制压缩后的图片
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        blob => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        file.type,
        quality
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}
