#!/usr/bin/env node

/**
 * Pre-commit quality checks
 * This script runs various quality checks before allowing commits
 */

const { execSync } = require('node:child_process')

console.log('🔍 Running pre-commit quality checks...')

const checks = [
  {
    name: 'TypeScript type checking',
    command: 'npx tsc --noEmit',
    description: 'Checking TypeScript types...',
  },
]

let hasErrors = false

for (const check of checks) {
  try {
    console.log(`\n📋 ${check.description}`)
    execSync(check.command, {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
    console.log(`✅ ${check.name} passed`)
  } catch (_error) {
    console.error(`❌ ${check.name} failed`)
    hasErrors = true
  }
}

if (hasErrors) {
  console.log(
    '\n❌ Pre-commit checks failed. Please fix the issues above before committing.'
  )
  process.exit(1)
} else {
  console.log('\n✅ All pre-commit checks passed!')
  process.exit(0)
}
