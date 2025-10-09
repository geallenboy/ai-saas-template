'use client'

import { AdminGuardClient } from '@/components/auth'
import { AdminBlogManager } from '@/components/front/blog/AdminBlogManager'

export default function AdminBlogPage() {
  return (
    <AdminGuardClient>
      <div className="container mx-auto py-6">
        <AdminBlogManager />
      </div>
    </AdminGuardClient>
  )
}
