import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

// Response data type
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Extending axios configuration type
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean
  skipErrorHandler?: boolean
}

// Request configuration type
export interface HttpClientConfig extends AxiosRequestConfig {
  skipAuth?: boolean
  skipErrorHandler?: boolean
}

// Create axios instance
const createHttpClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor
  client.interceptors.request.use(
    async (config: ExtendedAxiosRequestConfig) => {
      // Add auth header (in client-side, token can be obtained in other ways)
      if (!config.skipAuth && typeof window !== 'undefined') {
        try {
          // In client-side, token can be obtained from localStorage or other places
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

      // Add request ID for tracking
      config.headers = config.headers || {}
      config.headers['X-Request-ID'] =
        `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      // Unified handling of successful responses
      return response
    },
    (error: AxiosError<ApiResponse>) => {
      // Unified error handling
      const config = error.config as ExtendedAxiosRequestConfig
      if (!config?.skipErrorHandler) {
        handleHttpError(error)
      }
      return Promise.reject(error)
    }
  )

  return client
}

// Error handling function
const handleHttpError = (error: AxiosError<ApiResponse>) => {
  const { response, request, message } = error

  if (response) {
    // The server responded with an error status code
    const { status, data } = response
    const requestId = response.config?.headers?.['X-Request-ID'] as string

    console.error('HTTP request failed:', {
      category: 'http',
      status,
      statusText: response.statusText,
      method: response.config?.method?.toUpperCase(),
      url: response.config?.url,
      requestId,
      errorMessage: data?.error || data?.message || 'Request failed',
      responseData: data,
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    })

    // Special status code handling
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
    // The request was made but no response was received
    console.error('Network error:', {
      category: 'network',
      message: 'Request timed out or network unavailable',
      url: request.responseURL || 'unknown',
      timeout: request.timeout,
      action: 'retry_request',
    })
  } else {
    // Request configuration error
    console.error('Request configuration error:', {
      category: 'http',
      message,
      action: 'fix_configuration',
    })
  }
}

// Create HTTP client instance
export const httpClient = createHttpClient()

// Convenient methods
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

// Special method for file upload
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

// External API requests (bypass auth and error handling)
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

// Export types
export type { AxiosError, AxiosRequestConfig, AxiosResponse }
