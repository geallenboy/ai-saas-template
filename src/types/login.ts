// 登录表单数据类型
export interface LoginFormData {
  email: string
  password: string
}

// 登录组件的props类型
export interface LoginFormProps {
  formData: LoginFormData
  setFormData: (data: LoginFormData) => void
  isLoading: boolean
  error: string | null
  onEmailLogin: (e: React.FormEvent) => void
  onSocialLogin: (provider: 'github' | 'google') => void
  onClearError: () => void
}

// useLogin Hook返回类型
export interface UseLoginReturn {
  formData: LoginFormData
  setFormData: (data: LoginFormData) => void
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  handleEmailLogin: (e: React.FormEvent) => void
  handleSocialLogin: (provider: 'github' | 'google') => void
  handleClearError: () => void
  getRedirectUrl: () => string
}
