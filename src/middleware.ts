import { defaultLocale, locales } from '@/translate/i18n/config'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createIntlMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  // Place routes that require login here
  '/:locale/dashboard(.*)',
  '/:locale/settings(.*)',
  '/:locale/admin(.*)',
])

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export default clerkMiddleware(async (auth, req: any) => {
  // Check if it's an API route, if so, skip intl middleware
  if (
    req.nextUrl.pathname.startsWith('/api/') ||
    req.nextUrl.pathname.startsWith('/trpc/')
  ) {
    // For API routes, only perform auth check (if needed)
    if (isProtectedRoute(req)) {
      const { userId } = await auth()
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    return NextResponse.next()
  }

  if (isProtectedRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      // User is not logged in, redirect them to the login page.
      // We build the URL here to include the locale and redirect URL.
      const locale = req.nextUrl.pathname.split('/')[1] || defaultLocale
      const signInUrl = new URL(`/${locale}/auth/sign-in`, req.nextUrl.origin)
      signInUrl.searchParams.set('redirect_url', req.nextUrl.href)
      return NextResponse.redirect(signInUrl)
    }
  }

  // For page routes, we handle them with the next-intl middleware
  return intlMiddleware(req)
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
