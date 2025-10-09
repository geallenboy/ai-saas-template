'use client'

interface AuthProviderProps {
  children: React.ReactNode
}

// Better Auth 会自动处理初始化，我们只需要提供上下文
export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>
}
