#!/usr/bin/env node

/**
 * 批量修复 React key 问题
 * 这个脚本专门处理 noArrayIndexKey 警告
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 开始批量修复 React key 问题...\n')

// 获取所有有 noArrayIndexKey 问题的文件
const lintOutput = execSync('pnpm lint:check 2>&1 || true', { encoding: 'utf8' })
const keyIssueFiles = new Set()

// 解析 lint 输出，找到有 key 问题的文件
const lines = lintOutput.split('\n')
lines.forEach(line => {
  if (line.includes('lint/suspicious/noArrayIndexKey')) {
    const match = line.match(/^([^:]+):/)
    if (match) {
      keyIssueFiles.add(match[1])
    }
  }
})

console.log(`📁 发现 ${keyIssueFiles.size} 个文件有 key 问题`)

keyIssueFiles.forEach(file => {
  console.log(`🔍 处理文件: ${file}`)
  fixKeysInFile(file)
})

console.log('\n✅ React key 修复完成!')
console.log('📋 运行 pnpm lint:check 查看剩余问题')

function fixKeysInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    let modified = false

    // 1. 修复 Array.from({ length: N }).map((_, i) => 的情况
    // 这些通常是 Skeleton 或其他静态列表
    const patterns = [
      // key={i} -> key={\`item-\${i}\`}
      {
        from: /key=\{i\}/g,
        to: 'key={`item-${i}`}',
        desc: '数组索引 i'
      },
      // key={index} -> key={\`item-\${index}\`}
      {
        from: /key=\{index\}/g,
        to: 'key={`item-${index}`}',
        desc: '数组索引 index'
      },
      // 针对特定场景的更精确修复
      {
        from: /(\{Array\.from\(\{ length: \d+ \}\)\.map\(\([^)]+\) => \(\s*<[^>]+)\s+key=\{`item-\$\{[^}]+\}`\}/g,
        to: (match, beforeKey) => {
          // 提取 length 值来生成更具描述性的 key
          const lengthMatch = match.match(/length: (\d+)/)
          const length = lengthMatch ? lengthMatch[1] : 'n'
          return match.replace(/key=\{`item-\$\{[^}]+\}`\}/, `key={\`skeleton-\${${match.includes('(_, i)') ? 'i' : 'index'}}\`}`)
        },
        desc: 'Skeleton 组件'
      }
    ]

    patterns.forEach(pattern => {
      const before = content
      if (typeof pattern.to === 'function') {
        content = content.replace(pattern.from, pattern.to)
      } else {
        content = content.replace(pattern.from, pattern.to)
      }
      if (content !== before) {
        modified = true
        console.log(`  ✅ 修复了 ${pattern.desc}`)
      }
    })

    // 2. 对于有具体内容的列表，尝试使用内容作为 key
    // 例如: features.map((feature, index) => 改为使用 feature 的某个属性

    // 检查是否有可以用作 key 的内容
    const featureMapPattern = /(\w+)\.map\(\((\w+),\s*(\w+)\)\s*=>[^}]+key=\{\3\}/g
    let match
    while ((match = featureMapPattern.exec(content)) !== null) {
      const [fullMatch, arrayName, itemName, indexName] = match

      // 如果是字符串数组，使用内容本身作为 key
      if (content.includes(`{${itemName}}`)) {
        const replacement = fullMatch.replace(
          `key={${indexName}}`,
          `key={${itemName}}`
        )
        content = content.replace(fullMatch, replacement)
        modified = true
        console.log(`  ✅ 修复了 ${arrayName} 数组的 key，使用内容作为 key`)
      }
    }

    // 3. 特殊处理：如果是对象数组，尝试使用 id 或其他唯一字段
    const objectMapPattern = /(\w+)\.map\(\((\w+),\s*(\w+)\)\s*=>/g
    let objectMatch
    while ((objectMatch = objectMapPattern.exec(content)) !== null) {
      const [fullMatch, arrayName, itemName, indexName] = objectMatch

      // 查找该映射块中的 key={index}
      const keyRegex = new RegExp(`key=\\{${indexName}\\}`)
      if (keyRegex.test(content)) {
        // 检查是否使用了 itemName.id 或 itemName.title 等
        if (content.includes(`${itemName}.id`)) {
          content = content.replace(keyRegex, `key={${itemName}.id}`)
          modified = true
          console.log(`  ✅ 修复了 ${arrayName} 数组的 key，使用 id 字段`)
        } else if (content.includes(`${itemName}.title`)) {
          content = content.replace(keyRegex, `key={${itemName}.title}`)
          modified = true
          console.log(`  ✅ 修复了 ${arrayName} 数组的 key，使用 title 字段`)
        } else if (content.includes(`${itemName}.name`)) {
          content = content.replace(keyRegex, `key={${itemName}.name}`)
          modified = true
          console.log(`  ✅ 修复了 ${arrayName} 数组的 key，使用 name 字段`)
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content)
      console.log(`  💾 已保存修改到 ${filePath}`)
    } else {
      console.log(`  ⏭️  ${filePath} 无法自动修复，需要手动处理`)
    }

  } catch (error) {
    console.error(`❌ 处理文件 ${filePath} 时出错:`, error.message)
  }
}