// 通用类型定义
export interface IconProps {
  className?: string
  size?: number
}

export type IconComponent = React.ComponentType<IconProps>

export interface BaseProps {
  className?: string
  children?: React.ReactNode
}

export interface TeamMember {
  name: string
  role: string
  bio: string
  avatar: string
}

export interface Feature {
  title: string
  description: string
  details: string[]
  icon: IconComponent
}

export interface CompanyValue {
  title: string
  description: string
  icon: IconComponent
}

// 错误处理类型
export interface ApiError {
  message: string
  code?: string
  details?: unknown
}

// 表单相关类型
export interface FormField {
  id: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea'
  placeholder?: string
  required?: boolean
}
