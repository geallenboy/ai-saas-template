import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

// 响应数据类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 扩展axios配置类型
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean
  skipErrorHandler?: boolean
}

// 请求配置类型
export interface HttpClientConfig extends AxiosRequestConfig {
  skipAuth?: boolean
  skipErrorHandler?: boolean
}

// 创建axios实例
const createHttpClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // 请求拦截器
  client.interceptors.request.use(
    async (config: ExtendedAxiosRequestConfig) => {
      // 添加认证头 (在客户端运行时通过其他方式获取token)
      if (!config.skipAuth && typeof window !== 'undefined') {
        try {
          // 在客户端环境下，可以从localStorage或其他地方获取token
          const token =
            localStorage.getItem('auth_token') ||
            sessionStorage.getItem('auth_token')
          if (token) {
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${token}`
          }
        } catch (error) {
          console.warn('Failed to get auth token:', {
            error: error instanceof Error ? error.message : String(error),
            category: 'auth',
          })
        }
      }

      // 添加请求ID用于追踪
      config.headers = config.headers || {}
      config.headers['X-Request-ID'] =
        `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      // 统一处理成功响应
      return response
    },
    (error: AxiosError<ApiResponse>) => {
      // 统一错误处理
      const config = error.config as ExtendedAxiosRequestConfig
      if (!config?.skipErrorHandler) {
        handleHttpError(error)
      }
      return Promise.reject(error)
    }
  )

  return client
}

// 错误处理函数
const handleHttpError = (error: AxiosError<ApiResponse>) => {
  const { response, request, message } = error

  if (response) {
    // 服务器响应了错误状态码
    const { status, data } = response
    const requestId = response.config?.headers?.['X-Request-ID'] as string

    console.error('HTTP request failed:', {
      category: 'http',
      status,
      statusText: response.statusText,
      method: response.config?.method?.toUpperCase(),
      url: response.config?.url,
      requestId,
      errorMessage: data?.error || data?.message || '请求失败',
      responseData: data,
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    })

    // 特殊状态码处理
    switch (status) {
      case 401:
        console.warn('Authentication required:', {
          category: 'auth',
          url: response.config?.url,
          requestId,
          action: 'redirect_to_login',
        })
        break
      case 403:
        console.warn('Access forbidden:', {
          category: 'auth',
          url: response.config?.url,
          requestId,
          action: 'show_permission_error',
        })
        break
      case 404:
        console.warn('Resource not found:', {
          category: 'http',
          url: response.config?.url,
          requestId,
          action: 'show_not_found',
        })
        break
      case 429:
        console.warn('Rate limit exceeded:', {
          category: 'http',
          url: response.config?.url,
          requestId,
          retryAfter: response.headers['retry-after'],
          action: 'retry_later',
        })
        break
      case 500:
        console.error('Internal server error:', {
          category: 'http',
          url: response.config?.url,
          requestId,
          action: 'show_error_message',
        })
        break
      default:
        console.warn('HTTP error:', {
          category: 'http',
          status,
          url: response.config?.url,
          requestId,
        })
    }
  } else if (request) {
    // 请求已发出但没有收到响应
    console.error('Network error:', {
      category: 'network',
      message: '请求超时或网络不可用',
      url: request.responseURL || 'unknown',
      timeout: request.timeout,
      action: 'retry_request',
    })
  } else {
    // 请求配置错误
    console.error('Request configuration error:', {
      category: 'http',
      message,
      action: 'fix_configuration',
    })
  }
}

// 创建HTTP客户端实例
export const httpClient = createHttpClient()

// 便捷方法
export const http = {
  get: <T = any>(url: string, config?: HttpClientConfig) =>
    httpClient.get<ApiResponse<T>>(url, config),

  post: <T = any>(url: string, data?: any, config?: HttpClientConfig) =>
    httpClient.post<ApiResponse<T>>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: HttpClientConfig) =>
    httpClient.put<ApiResponse<T>>(url, data, config),

  patch: <T = any>(url: string, data?: any, config?: HttpClientConfig) =>
    httpClient.patch<ApiResponse<T>>(url, data, config),

  delete: <T = any>(url: string, config?: HttpClientConfig) =>
    httpClient.delete<ApiResponse<T>>(url, config),
}

// 文件上传专用方法
export const uploadFile = async (
  url: string,
  file: File | FormData,
  config?: HttpClientConfig & {
    onProgress?: (progress: number) => void
  }
) => {
  const formData = file instanceof FormData ? file : new FormData()
  if (file instanceof File) {
    formData.append('file', file)
  }

  return httpClient.post<ApiResponse<any>>(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config?.headers,
    },
    onUploadProgress: progressEvent => {
      if (progressEvent.total && config?.onProgress) {
        const progress = Math.round(
          (progressEvent.loaded / progressEvent.total) * 100
        )
        config.onProgress(progress)
      }
    },
  })
}

// 外部API请求（跳过认证和错误处理）
export const externalHttp = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    axios.get<T>(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axios.post<T>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axios.put<T>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    axios.delete<T>(url, config),
}

// 导出类型
export type { AxiosError, AxiosRequestConfig, AxiosResponse }
