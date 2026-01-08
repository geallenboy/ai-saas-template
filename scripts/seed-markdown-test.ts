#!/usr/bin/env tsx
/**
 * 创建Markdown功能测试文章
 */

import { config } from 'dotenv'
config()

import { db } from '@/lib/db'
import { blogPosts, users } from '@/drizzle/schemas'
import { eq } from 'drizzle-orm'

const markdownTestPost = {
  title: 'Markdown 功能完整测试',
  slug: 'markdown-features-test',
  summary: '这篇文章展示了所有支持的 Markdown 语法和功能，包括代码高亮、表格、列表等。',
  content: `# Markdown 功能完整测试

这篇文章展示了blog系统支持的所有 Markdown 语法和功能。

## 标题层级

### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

## 文本样式

这是普通文本。**这是粗体文本**。*这是斜体文本*。***这是粗斜体文本***。

你也可以使用 ~~删除线~~ 来标记已删除的内容。

## 列表

### 无序列表

- 第一项
- 第二项
  - 嵌套项 2.1
  - 嵌套项 2.2
- 第三项

### 有序列表

1. 第一步
2. 第二步
3. 第三步
   1. 子步骤 3.1
   2. 子步骤 3.2

## 代码

### 行内代码

使用 \`console.log()\` 来输出日志信息。变量 \`userName\` 存储用户名。

### 代码块

#### JavaScript

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`)
  return \`Welcome, \${name}\`
}

const user = {
  name: 'Alice',
  age: 30,
  email: 'alice@example.com'
}

greet(user.name)
\`\`\`

#### TypeScript

\`\`\`typescript
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`)
  const data = await response.json()
  return data as User
}

const adminUser: User = {
  id: '123',
  name: 'Admin',
  email: 'admin@example.com',
  role: 'admin'
}
\`\`\`

#### Python

\`\`\`python
def fibonacci(n):
    """计算斐波那契数列的第n项"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 计算前10项
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

#### SQL

\`\`\`sql
SELECT
  u.id,
  u.name,
  u.email,
  COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON p.author_id = u.id
WHERE u.is_active = true
GROUP BY u.id, u.name, u.email
ORDER BY post_count DESC
LIMIT 10;
\`\`\`

#### JSON

\`\`\`json
{
  "name": "AI SaaS Template",
  "version": "1.0.0",
  "features": [
    "Next.js 15",
    "React 19",
    "TypeScript",
    "tRPC",
    "Drizzle ORM"
  ],
  "config": {
    "theme": "dark",
    "locale": "zh"
  }
}
\`\`\`

## 引用

> 这是一段引用文本。
>
> 引用可以包含多个段落。
>
> — 著名人士

> **注意**: 这是一个重要的提示框。

## 链接

这是一个 [内部链接](/docs) 和一个 [外部链接](https://nextjs.org)。

你也可以使用自动链接：https://github.com

## 表格

| 功能 | 状态 | 优先级 | 备注 |
|------|------|--------|------|
| Markdown 渲染 | ✅ 完成 | 高 | 支持 GFM |
| 代码高亮 | ✅ 完成 | 高 | 使用 Prism |
| 表格支持 | ✅ 完成 | 中 | GitHub 风格 |
| 图片支持 | ✅ 完成 | 中 | 懒加载 |
| 数学公式 | ⏳ 计划中 | 低 | KaTeX |

### 对齐方式

| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:--------:|-------:|
| 内容1  | 内容2    | 内容3  |
| A      | B        | C      |

## 分隔线

上面的内容

---

下面的内容

## 任务列表

- [x] 完成 Markdown 组件开发
- [x] 添加代码高亮功能
- [x] 支持表格渲染
- [ ] 添加数学公式支持
- [ ] 支持图表渲染

## 图片

虽然这里没有实际图片，但语法是这样的：

![占位图片](https://via.placeholder.com/600x300?text=Markdown+Image+Support)

## 嵌套结构示例

1. 第一项
   - 子项 A
   - 子项 B
     \`\`\`javascript
     console.log('代码在列表中')
     \`\`\`
   - 子项 C

2. 第二项
   > 引用在列表中
   >
   > 可以多行

3. 第三项

## 总结

这个 Markdown 渲染器支持：

1. **标题** - H1 到 H6
2. **文本样式** - 粗体、斜体、删除线
3. **列表** - 有序、无序、嵌套
4. **代码** - 行内代码和代码块（含高亮）
5. **引用块** - 单行和多行
6. **链接** - 内部和外部链接
7. **表格** - GitHub 风格表格
8. **分隔线**
9. **任务列表**
10. **图片** - 支持懒加载

---

**提示**: 这是一个完整的 Markdown 功能测试页面，用于验证渲染器的各项功能。`,
  coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
  tags: ['Markdown', '测试', '文档'],
  isFeatured: true,
  status: 'published' as const,
  locale: 'zh',
}

async function main() {
  console.log('创建 Markdown 测试文章...\n')

  const adminUser = await db.query.users.findFirst({
    where: eq(users.adminLevel, 1),
  })

  if (!adminUser) {
    console.error('❌ 错误: 未找到管理员用户')
    process.exit(1)
  }

  console.log(`✓ 找到管理员用户: ${adminUser.email}\n`)

  const now = new Date()

  await db.insert(blogPosts).values({
    ...markdownTestPost,
    authorId: adminUser.id,
    publishedAt: now,
    readingMinutes: Math.ceil(markdownTestPost.content.length / 1000),
    createdAt: now,
    updatedAt: now,
  })

  console.log('✓ 创建测试文章成功!')
  console.log('\n访问地址: http://localhost:3002/zh/blog/markdown-features-test')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('错误:', error)
    process.exit(1)
  })
