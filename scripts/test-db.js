// 测试数据库连接的脚本
import { config } from 'dotenv'
import postgres from 'postgres'

// 加载环境变量
config()

console.log('DATABASE_URL:', process.env.DATABASE_URL)

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL环境变量未设置')
  process.exit(1)
}

try {
  console.log('🔄 尝试连接数据库...')
  const sql = postgres(process.env.DATABASE_URL)

  const result = await sql`SELECT version()`
  console.log('✅ 数据库连接成功！')
  console.log('数据库版本:', result[0].version)

  await sql.end()
  console.log('✅ 连接已关闭')
} catch (error) {
  console.error('❌ 数据库连接失败:', error.message)
  if (error.code === 'ECONNREFUSED') {
    console.error('   原因: 无法连接到数据库服务器')
    console.error('   检查: 数据库地址、端口、网络连接')
  }
}
