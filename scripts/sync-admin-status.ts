import { users } from '@/drizzle/schemas'
import { updateClerkUserMetadata } from '@/lib/clerk'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'

async function syncAdminStatus() {
  console.log('Start syncing administrator status to Clerk...')

  try {
    // Get all admin users
    const adminUsers = await db
      .select()
      .from(users)
      .where(eq(users.isAdmin, true))

    console.log(`Found ${adminUsers.length} admin users`)

    for (const user of adminUsers) {
      try {
        console.log(`Syncing user: ${user.email} (${user.id})`)

        // Update publicMetadata in Clerk
        await updateClerkUserMetadata(user.id, {
          isAdmin: true,
          adminLevel: user.adminLevel || 1,
          role: 'admin',
        })

        console.log(`✅ ${user.email} synced successfully`)
      } catch (error) {
        console.error(`❌ ${user.email} sync failed:`, error)
      }
    }

    console.log('Sync completed!')
  } catch (error) {
    console.error('Sync process error:', error)
  }
}

// If you run this script directly
if (require.main === module) {
  syncAdminStatus()
    .then(() => {
      process.exit(0)
    })
    .catch(error => {
      console.error('Script execution failed:', error)
      process.exit(1)
    })
}

export { syncAdminStatus }
