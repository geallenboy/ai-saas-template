import * as dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

dotenv.config({ path: ['.env.local', '.env'] })

// Get different database configurations according to the environment
const getDbConfig = () => {
  const dbUrl = process.env.DATABASE_URL

  if (!dbUrl) {
    throw new Error('DATABASE_URL Environment variables must be set')
  }

  // Detecting whether it is a cloud database (SSL required)
  const isCloudDatabase =
    dbUrl.includes('neon.tech') ||
    dbUrl.includes('supabase.co') ||
    dbUrl.includes('planetscale.com') ||
    dbUrl.includes('railway.app') ||
    process.env.NODE_ENV === 'production'

  return {
    url: dbUrl,
    ssl: isCloudDatabase ? { rejectUnauthorized: false } : false,
  }
}

export default defineConfig({
  out: './src/drizzle/migrations',
  schema: './src/drizzle/schemas',
  dialect: 'postgresql',
  strict: true,
  verbose: true,
  dbCredentials: getDbConfig(),
})
