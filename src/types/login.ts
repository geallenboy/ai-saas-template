// Login form data type
export interface LoginFormData {
  email: string
  password: string
}

// Login component props type
export interface LoginFormProps {
  formData: LoginFormData
  setFormData: (data: LoginFormData) => void
  isLoading: boolean
  error: string | null
  onEmailLogin: (e: React.FormEvent) => void
  onSocialLogin: (provider: 'github' | 'google') => void
  onClearError: () => void
}

// useLogin Hook return type
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
