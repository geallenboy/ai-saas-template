import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

/**
 * Compatibility endpoint for legacy auth session polling.
 * Auth module has been removed in this branch, so always return null session.
 */
export async function GET() {
  return NextResponse.json(
    {
      session: null,
      user: null,
    },
    { status: 200 }
  )
}
