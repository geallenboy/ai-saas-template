#!/usr/bin/env tsx
/**
 * 检查数据库中的用户
 */

import { config } from 'dotenv'
config()

import { db } from '@/lib/db'
import { users } from '@/drizzle/schemas'

async function main() {
  console.log('查询数据库中的所有用户...\n')

  const allUsers = await db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    adminLevel: users.adminLevel,
  }).from(users)

  if (allUsers.length === 0) {
    console.log('❌ 数据库中没有用户')
    console.log('\n请先注册一个账号:')
    console.log('1. 启动开发服务器: pnpm dev')
    console.log('2. 访问: http://localhost:3000/auth/sign-up')
    console.log('3. 注册一个新账号')
  } else {
    console.log(`找到 ${allUsers.length} 个用户:\n`)
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   姓名: ${user.name || '(未设置)'}`)
      console.log(`   管理员级别: ${user.adminLevel}`)
      console.log('')
    })

    const hasAdmin = allUsers.some(u => (u.adminLevel ?? 0) >= 1)
    if (!hasAdmin) {
      console.log('💡 提示: 没有管理员用户。可以运行以下脚本将用户提升为管理员:')
      console.log('   pnpm tsx scripts/make-admin.ts <用户email>')
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('错误:', error)
    process.exit(1)
  })
