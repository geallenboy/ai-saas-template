'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User } from '@/drizzle/schemas'
import { trpc } from '@/lib/trpc/client'
import {
  Edit,
  MoreHorizontal,
  Shield,
  ShieldOff,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface UserActionsProps {
  user: User
}

export function UserActions({ user }: UserActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showToggleDialog, setShowToggleDialog] = useState(false)
  const [showPromoteDialog, setShowPromoteDialog] = useState(false)
  const router = useRouter()

  const utils = trpc.useUtils()

  const deleteUserMutation = trpc.users.deleteUser.useMutation({
    onSuccess: () => {
      // Refresh data and return to the list page
      utils.users.getUsers.invalidate()
      utils.users.getUserStats.invalidate()
      setShowDeleteDialog(false)
      router.push('/admin/users')
    },
    onError: error => {
      console.error('Failed to delete user:', error)
    },
  })

  const toggleStatusMutation = trpc.users.toggleUserStatus.useMutation({
    onSuccess: () => {
      // Refresh user details and list data
      utils.users.getUserById.invalidate({ id: user.id })
      utils.users.getUsers.invalidate()
      utils.users.getUserStats.invalidate()
      setShowToggleDialog(false)
    },
    onError: error => {
      console.error('Failed to switch user status:', error)
    },
  })

  const updateUserMutation = trpc.users.updateUser.useMutation({
    onSuccess: () => {
      // Refresh user details and list data
      utils.users.getUserById.invalidate({ id: user.id })
      utils.users.getUsers.invalidate()
      utils.users.getUserStats.invalidate()
      setShowPromoteDialog(false)
    },
    onError: error => {
      console.error('Update user failed:', error)
    },
  })

  const handleDelete = () => {
    deleteUserMutation.mutate({ id: user.id })
  }

  const handleToggleStatus = () => {
    toggleStatusMutation.mutate({ id: user.id })
  }

  const handleToggleAdmin = () => {
    updateUserMutation.mutate({
      id: user.id,
      isAdmin: !user.isAdmin,
    })
  }

  const isPending =
    deleteUserMutation.isPending ||
    toggleStatusMutation.isPending ||
    updateUserMutation.isPending

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowToggleDialog(true)}>
            {user.isActive ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Disable User
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Activate User
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowPromoteDialog(true)}>
            {user.isAdmin ? (
              <>
                <ShieldOff className="mr-2 h-4 w-4" />
                Revoke Admin Role
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Grant Admin Role
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete user {user.email}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status toggle confirmation dialog */}
      <AlertDialog open={showToggleDialog} onOpenChange={setShowToggleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.isActive ? 'Disable User' : 'Activate User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {user.isActive ? 'disable' : 'activate'}{' '}
              user {user.email}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              disabled={isPending}
            >
              {toggleStatusMutation.isPending
                ? 'Processing...'
                : `Confirm ${user.isActive ? 'Disable' : 'Activate'}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Admin role toggle confirmation dialog */}
      <AlertDialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.isAdmin ? 'Revoke Admin Role' : 'Grant Admin Role'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {user.isAdmin ? 'revoke' : 'grant'} user{' '}
              {user.email} admin privileges?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleAdmin} disabled={isPending}>
              {updateUserMutation.isPending
                ? 'Processing...'
                : 'Confirm Action'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
