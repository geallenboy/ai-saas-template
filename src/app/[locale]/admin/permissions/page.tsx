'use client'

import { PermissionManagement } from '@/components/admin/permissions'
import { SuperAdminGuardClient } from '@/components/auth'

export default function AdminPermissionsPage() {
  return (
    <SuperAdminGuardClient>
      <div className="container mx-auto py-6">
        <PermissionManagement />
      </div>
    </SuperAdminGuardClient>
  )
}
