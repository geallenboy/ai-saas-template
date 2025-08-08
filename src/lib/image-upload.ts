/**
 * Image upload utility functions
 * Supports uploading files and URLs to Cloudflare Images
 */

/**
 * Get the full API URL
 * @param path - API path
 * @returns The full API URL
 */
function getApiUrl(path: string): string {
  // In the client, use the current domain
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`
  }

  // On the server side, must use the full URL
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
 * Upload a file to the server
 * @param file - The file to upload
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
 * Upload an image to the server via URL
 * @param url - The image URL
 * @param filename - Optional filename
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
      url: url.substring(0, 100), // Limit URL length to avoid overly long logs
      action: 'url_upload',
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Get image information
 * @param imageId - The image ID
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
 * Verify that the file is a valid image.
 * @param file - the file to be verified.
 * @returns the verification result.
 */
export function validateImageFile(file: File): {
  isValid: boolean
  error?: string
} {
  // Validate file type
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

  // Validate file size (max 10MB)
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
 * Verify that the URL is a valid image URL
 * @param url - URL to verify
 * @returns Verification result
 */
export function validateImageUrl(url: string): {
  isValid: boolean
  error?: string
} {
  try {
    const parsedUrl = new URL(url)

    // Check protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        isValid: false,
        error: 'Invalid URL protocol. Only HTTP and HTTPS are allowed.',
      }
    }

    // Check file extension (optional)
    const pathname = parsedUrl.pathname.toLowerCase()
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
    const hasImageExtension = imageExtensions.some(ext =>
      pathname.endsWith(ext)
    )

    // If the URL does not have a clear image extension, issue a warning but still allow
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
 * Convert a file to a Data URL for preview
 * @param file - The file to convert
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
 * Compress an image (if needed)
 * @param file - The original file
 * @param maxWidth - The maximum width
 * @param maxHeight - The maximum height
 * @param quality - The compression quality (0-1)
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
      // Calculate new dimensions
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

      // Draw the compressed image
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
