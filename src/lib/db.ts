import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
// 导入所有schema和关系定义
import * as schema from '@/drizzle/schemas'
import { env } from '@/env'

const connection = postgres(env.DATABASE_URL)

export const db = drizzle(connection, {
  schema,
  logger: env.NODE_ENV === 'development',
})

// 导出schema以便在其他地方使用
export { schema }

// 导出常用类型
export type Database = typeof db
export type DatabaseTransaction = Parameters<
  Parameters<typeof db.transaction>[0]
>[0]

// 健康检查函数
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await db.execute('SELECT 1')
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

// 关闭数据库连接 (用于优雅关闭)
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await connection.end()
  } catch (error) {
    console.error('Error closing database connection:', error)
  }
}
