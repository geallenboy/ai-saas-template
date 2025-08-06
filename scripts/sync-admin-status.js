const { Pool } = require('pg')
const { createClerkClient } = require('@clerk/backend')

// Get configuration from environment variables
require('dotenv').config()

const DATABASE_URL = process.env.DATABASE_URL
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY

if (!(DATABASE_URL && CLERK_SECRET_KEY)) {
  console.error(
    '❌ Missing necessary environment variables: DATABASE_URL or CLERK_SECRET_KEY'
  )
  process.exit(1)
}

// Initialize database connection
const pool = new Pool({
  connectionString: DATABASE_URL,
})

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: CLERK_SECRET_KEY,
})

async function syncAdminStatus() {
  console.log('🚀 Start syncing administrator status to Clerk...')

  try {
    // Get all admin users
    const result = await pool.query('SELECT * FROM users WHERE is_admin = true')
    const adminUsers = result.rows

    console.log(`📋 Found ${adminUsers.length} admin users`)

    if (adminUsers.length === 0) {
      console.log(
        '⚠️  No admin users found, please set is_admin = true in the database first'
      )
      return
    }

    for (const user of adminUsers) {
      try {
        console.log(`🔄 Syncing user: ${user.email} (${user.id})`)

        // Update publicMetadata in Clerk
        await clerkClient.users.updateUser(user.id, {
          publicMetadata: {
            isAdmin: true,
            adminLevel: user.admin_level || 1,
            role: 'admin',
          },
        })

        console.log(`✅ ${user.email} synced successfully`)
      } catch (error) {
        console.error(`❌ ${user.email} sync failed:`, error.message)
      }
    }

    console.log(
      '🎉 Sync completed! You should now see the admin entry in the navigation menu.'
    )
  } catch (error) {
    console.error('💥 Sync process error:', error.message)
  } finally {
    await pool.end()
  }
}

// Execute sync
syncAdminStatus()
  .then(() => {
    console.log('✨ Script execution completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('🚨 Script execution failed:', error.message)
    process.exit(1)
  })
