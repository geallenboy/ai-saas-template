'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import {
  RefreshCwIcon,
  XCircleIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Dynamically import react-pdf components to avoid SSR issues
const Document = dynamic(() => import('react-pdf').then(mod => mod.Document), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="flex flex-col items-center gap-2">
        <RefreshCwIcon className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">
          初始化 PDF 查看器...
        </span>
      </div>
    </div>
  ),
})

const Page = dynamic(() => import('react-pdf').then(mod => mod.Page), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg shadow">
      <RefreshCwIcon className="h-4 w-4 animate-spin text-primary" />
    </div>
  ),
})

// Configure PDF.js worker only on client side
if (typeof window !== 'undefined') {
  import('react-pdf').then(({ pdfjs }) => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  })
}

interface PDFViewerClientProps {
  file: string | File
  className?: string
  onLoadSuccess?: (data: { numPages: number }) => void
  onLoadError?: (error: Error) => void
}

export function PDFViewerClient({
  file,
  className = '',
  onLoadSuccess,
  onLoadError,
}: PDFViewerClientProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.2)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages)
      setLoading(false)
      setError(null)
      onLoadSuccess?.({ numPages })
    },
    [onLoadSuccess]
  )

  const handleLoadError = useCallback(
    (error: Error) => {
      console.error('PDF load error:', error)
      setError('PDF 加载失败，请检查文件格式')
      setLoading(false)
      onLoadError?.(error)
    },
    [onLoadError]
  )

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1))
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5))
  }

  const resetZoom = () => {
    setScale(1.2)
  }

  // Don't render on server
  if (!mounted) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <RefreshCwIcon className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            初始化 PDF 查看器...
          </span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center p-6">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            PDF 加载失败
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={() => {
              setError(null)
              setLoading(true)
            }}
            variant="outline"
            size="sm"
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            重试
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`pdf-viewer-container ${className}`}>
      {/* PDF Toolbar */}
      <div className="pdf-toolbar sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between">
          {/* Page Navigation */}
          <div className="pdf-navigation">
            <Button
              onClick={goToPrevPage}
              size="sm"
              variant="outline"
              disabled={pageNumber <= 1 || loading}
            >
              上一页
            </Button>
            <Button
              onClick={goToNextPage}
              size="sm"
              variant="outline"
              disabled={pageNumber >= (numPages || 1) || loading}
            >
              下一页
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              第 {pageNumber} 页 / 共 {numPages || '-'} 页
            </span>
          </div>

          {/* Zoom Controls */}
          <div className="pdf-zoom-controls">
            <Button
              onClick={zoomOut}
              size="sm"
              variant="ghost"
              disabled={loading}
            >
              <ZoomOutIcon className="h-4 w-4" />
            </Button>
            <Button
              onClick={resetZoom}
              size="sm"
              variant="ghost"
              disabled={loading}
              className="min-w-[60px]"
            >
              {Math.round(scale * 100)}%
            </Button>
            <Button
              onClick={zoomIn}
              size="sm"
              variant="ghost"
              disabled={loading}
            >
              <ZoomInIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
        <div className="flex justify-center">
          <Document
            file={file}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
            loading={
              <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCwIcon className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    加载 PDF 中...
                  </span>
                </div>
              </div>
            }
            error={
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <XCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600">PDF 加载失败</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    请检查文件格式是否正确
                  </p>
                </div>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading={
                <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <RefreshCwIcon className="h-4 w-4 animate-spin text-primary" />
                </div>
              }
              error={
                <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="text-center">
                    <XCircleIcon className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-red-600">页面加载失败</p>
                  </div>
                </div>
              }
              className="shadow-lg"
            />
          </Document>
        </div>
      </div>
    </div>
  )
}
