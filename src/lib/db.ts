import { env } from '@/env'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// Import all schema and relationship definitions
import * as schema from '@/drizzle/schemas'

const connection = postgres(env.DATABASE_URL)

export const db = drizzle(connection, {
  schema,
  logger: env.NODE_ENV === 'development',
})

// Export schema for use in other places
export { schema }

// Export common types
export type Database = typeof db
export type DatabaseTransaction = Parameters<
  Parameters<typeof db.transaction>[0]
>[0]

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await db.execute('SELECT 1')
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

// Close database connection (for graceful shutdown)
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await connection.end()
  } catch (error) {
    console.error('Error closing database connection:', error)
  }
}
