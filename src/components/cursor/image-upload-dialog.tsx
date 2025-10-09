'use client'

import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  FileImage,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Upload,
  X,
} from 'lucide-react'
import Image from 'next/image'
import type React from 'react'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ImageUploadResult } from '@/lib/image-upload'
import {
  compressImage,
  fileToDataUrl,
  uploadImageFile,
  uploadImageFromUrl,
  validateImageFile,
  validateImageUrl,
} from '@/lib/image-upload'
import { logger } from '@/lib/logger'

interface ImageUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onImageSelect: (imageData: {
    url: string
    alt: string
    title?: string
  }) => void
  title?: string
  description?: string
}

const ImageUploadDialog: React.FC<ImageUploadDialogProps> = ({
  isOpen,
  onClose,
  onImageSelect,
  title = '插入图片',
  description = '上传图片或通过URL添加图片到编辑器中',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [imageUrl, setImageUrl] = useState('')
  const [altText, setAltText] = useState('')
  const [titleText, setTitleText] = useState('')
  const [error, setError] = useState('')
  const [uploadedResult, setUploadedResult] = useState<
    ImageUploadResult['data'] | null
  >(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<HTMLLabelElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // 重置状态
  const resetState = useCallback(() => {
    setSelectedFile(null)
    setPreviewUrl('')
    setImageUrl('')
    setAltText('')
    setTitleText('')
    setError('')
    setUploadedResult(null)
    setUploadProgress(0)
    setIsUploading(false)
    setIsDragging(false)
  }, [])

  // 关闭对话框
  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [resetState, onClose])

  // 处理文件选择
  const handleFileSelect = useCallback(
    async (file: File) => {
      setError('')

      // 验证文件
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        setError(validation.error || '无效的文件')
        return
      }

      setSelectedFile(file)

      try {
        // 生成预览
        const dataUrl = await fileToDataUrl(file)
        setPreviewUrl(dataUrl)

        // 自动设置alt文本
        if (!altText) {
          const fileName = file.name.replace(/\.[^/.]+$/, '') // 移除扩展名
          setAltText(fileName)
        }
      } catch (err) {
        setError('无法生成图片预览')
        logger.error('Failed to generate image preview', err as Error, {
          category: 'ui',
          component: 'ImageUploadDialog',
          operation: 'generatePreview',
        })
      }
    },
    [altText]
  )

  // 处理文件上传
  const handleFileUpload = useCallback(async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)
    setError('')

    try {
      // 模拟进度（因为fetch API不支持真实进度监控）
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 30, 90))
      }, 200)

      let fileToUpload = selectedFile

      // 如果文件过大，尝试压缩
      if (selectedFile.size > 2 * 1024 * 1024) {
        // 2MB
        try {
          fileToUpload = await compressImage(selectedFile)
          toast.info('图片已自动压缩以提高上传速度')
        } catch (compressionError) {
          logger.warn('Image compression failed', {
            category: 'ui',
            component: 'ImageUploadDialog',
            operation: 'compressImage',
            error:
              compressionError instanceof Error
                ? compressionError.message
                : String(compressionError),
          })
          // 继续使用原文件
        }
      }

      const result = await uploadImageFile(fileToUpload)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.success && result.data) {
        setUploadedResult(result.data)
        toast.success('图片上传成功！')

        // 自动设置alt文本（如果没有）
        if (!altText) {
          setAltText(result.data.filename.replace(/\.[^/.]+$/, ''))
        }
      } else {
        throw new Error(result.error || '上传失败')
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '上传失败，请重试'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }, [selectedFile, altText])

  // 处理URL上传
  const handleUrlUpload = useCallback(async () => {
    if (!imageUrl.trim()) {
      setError('请输入图片URL')
      return
    }

    // 验证URL
    const validation = validateImageUrl(imageUrl)
    if (!validation.isValid) {
      setError(validation.error || '无效的URL')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const result = await uploadImageFromUrl(imageUrl, titleText)

      if (result.success && result.data) {
        setUploadedResult(result.data)
        setPreviewUrl(result.data.url)
        toast.success('图片上传成功！')

        // 自动设置alt文本（如果没有）
        if (!altText) {
          const filename = result.data.filename || 'image'
          setAltText(filename.replace(/\.[^/.]+$/, ''))
        }
      } else {
        throw new Error(result.error || '上传失败')
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '上传失败，请重试'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }, [imageUrl, titleText, altText])

  // 插入图片
  const handleInsertImage = useCallback(() => {
    const finalUrl = uploadedResult?.url || imageUrl
    const finalAlt = altText.trim() || 'image'
    const finalTitle = titleText.trim()

    if (!finalUrl) {
      setError('没有可用的图片URL')
      return
    }

    onImageSelect({
      url: finalUrl,
      alt: finalAlt,
      title: finalTitle,
    })

    toast.success('图片已插入编辑器')
    handleClose()
  }, [uploadedResult, imageUrl, altText, titleText, onImageSelect, handleClose])

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      const imageFile = files.find(file => file.type.startsWith('image/'))

      if (imageFile) {
        handleFileSelect(imageFile)
      } else {
        setError('请拖拽图片文件')
      }
    },
    [handleFileSelect]
  )

  // 文件输入处理
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect]
  )

  // 复制URL到剪贴板
  const copyUrlToClipboard = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('URL已复制到剪贴板')
    } catch (_err) {
      toast.error('复制失败')
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={tab => setActiveTab(tab as 'upload' | 'url')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              文件上传
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              URL上传
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* 拖拽上传区域 */}
            <label
              ref={dragRef}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={event => {
                if ((event.target as HTMLElement).closest('button')) {
                  return
                }
                fileInputRef.current?.click()
              }}
              htmlFor="image-upload-input"
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">文件已选择</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <FileImage className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                    <Badge variant="secondary">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  </div>
                  {previewUrl && (
                    <div className="flex justify-center">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={160}
                        height={160}
                        unoptimized
                        className="max-w-40 max-h-40 rounded-lg border shadow-sm object-cover"
                      />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewUrl('')
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    移除文件
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      拖拽图片到此处
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      或者点击选择文件
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    选择图片
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    支持 JPEG, PNG, GIF, WebP, BMP 格式，最大 10MB
                  </p>
                </div>
              )}
            </label>

            <input
              ref={fileInputRef}
              id="image-upload-input"
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {selectedFile && !uploadedResult && (
              <Button
                onClick={handleFileUpload}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    上传中... {Math.round(uploadProgress)}%
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    上传图片
                  </>
                )}
              </Button>
            )}

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                  上传进度: {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-url">图片URL</Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  disabled={isUploading}
                />
              </div>

              {imageUrl && !uploadedResult && (
                <Button
                  onClick={handleUrlUpload}
                  disabled={isUploading || !imageUrl.trim()}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      从URL导入
                    </>
                  )}
                </Button>
              )}

              {/* URL预览 */}
              {imageUrl && !isUploading && (
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL预览：
                  </p>
                  <div className="flex justify-center">
                    <Image
                      src={imageUrl}
                      alt="URL Preview"
                      width={160}
                      height={160}
                      unoptimized
                      className="max-w-40 max-h-40 rounded border object-cover"
                      onError={() =>
                        setError('无法加载图片，请检查URL是否正确')
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* 上传成功后的结果展示 */}
        {uploadedResult && (
          <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Check className="h-5 w-5" />
              <span className="font-medium">上传成功！</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  Cloudflare URL:
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyUrlToClipboard(uploadedResult.url)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(uploadedResult.url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded border break-all">
                {uploadedResult.url}
              </p>
            </div>

            {previewUrl && (
              <div className="flex justify-center">
                <Image
                  src={previewUrl}
                  alt="Uploaded"
                  width={160}
                  height={160}
                  unoptimized
                  className="max-w-40 max-h-40 rounded border object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* 图片属性设置 */}
        {(uploadedResult || (imageUrl && previewUrl)) && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              图片属性
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="alt-text">替代文字 (Alt Text)</Label>
                <Input
                  id="alt-text"
                  placeholder="描述图片内容"
                  value={altText}
                  onChange={e => setAltText(e.target.value)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  用于屏幕阅读器和SEO优化
                </p>
              </div>

              <div>
                <Label htmlFor="title-text">标题 (可选)</Label>
                <Input
                  id="title-text"
                  placeholder="鼠标悬停时显示的文字"
                  value={titleText}
                  onChange={e => setTitleText(e.target.value)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  鼠标悬停时的提示文字
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="flex items-start gap-2 p-3 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">错误</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button
            onClick={handleInsertImage}
            disabled={!(uploadedResult || imageUrl)}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            插入图片
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ImageUploadDialog
