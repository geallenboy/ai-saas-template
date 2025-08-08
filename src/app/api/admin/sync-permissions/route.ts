import { users } from '@/drizzle/schemas'
import { updateClerkUserMetadata } from '@/lib/clerk'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Check if there is certification
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if the current user is an admin
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all admin users
    const adminUsers = await db
      .select()
      .from(users)
      .where(eq(users.isAdmin, true))

    let successCount = 0
    let failedCount = 0
    const results = []

    for (const user of adminUsers) {
      try {
        await updateClerkUserMetadata(user.id, {
          isAdmin: true,
          adminLevel: user.adminLevel || 1,
          role: 'admin',
        })

        successCount++
        results.push({
          userId: user.id,
          email: user.email,
          status: 'success',
        })
      } catch (error) {
        failedCount++
        results.push({
          userId: user.id,
          email: user.email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      message: 'Admin permission synchronization completed',
      total: adminUsers.length,
      successCount,
      failedCount,
      results,
    })
  } catch (error) {
    console.error('Failed to synchronize admin permissions:', error)
    return NextResponse.json(
      {
        error: 'Synchronization failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
