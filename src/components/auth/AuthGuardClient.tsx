'use client'

import { AUTH_ROUTES } from '@/constants/auth'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AuthGuardClientProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdminAccess?: boolean
  redirectTo?: string
}

export function AuthGuardClient({
  children,
  requireAuth = false,
  requireAdminAccess = false,
  redirectTo = AUTH_ROUTES.SIGN_IN,
}: AuthGuardClientProps) {
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isLoaded) return

    const needsAuth = requireAuth || requireAdminAccess

    // Check certification requirements
    if (needsAuth) {
      if (!isSignedIn) {
        router.push(redirectTo)
        return
      }

      // Check admin permissions
      if (requireAdminAccess) {
        const isAdmin = user?.publicMetadata?.isAdmin
        if (!isAdmin) {
          router.push('/')
          return
        }
      }
    }

    setIsInitialized(true)
  }, [
    isLoaded,
    isSignedIn,
    user,
    requireAuth,
    requireAdminAccess,
    redirectTo,
    router,
  ])

  // Show loading state until authentication check is complete
  const isLoading = !(isLoaded && isInitialized)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const needsAuth = requireAuth || requireAdminAccess

  // If authentication is required but not signed in, do not render content (will redirect)
  if (needsAuth && !isSignedIn) {
    return null
  }

  // If admin access is required but not an admin, do not render content (will redirect)
  const isAdmin = user?.publicMetadata?.isAdmin
  if (requireAdminAccess && !isAdmin) {
    return null
  }

  return <>{children}</>
}

// Dedicated administrator guard component
export function AdminGuardClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuardClient requireAuth requireAdminAccess>
      {children}
    </AuthGuardClient>
  )
}
