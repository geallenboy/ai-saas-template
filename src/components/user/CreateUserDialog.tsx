'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { trpc } from '@/lib/trpc/client'
import { Loader2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface CreateUserDialogProps {
  children?: React.ReactNode
}

export function CreateUserDialog({ children }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    isAdmin: false,
    adminLevel: 0,
    isActive: true,
  })

  const utils = trpc.useUtils()

  const createUser = trpc.users.createUser.useMutation({
    onSuccess: data => {
      toast.success(`User "${data.fullName}" created successfully`)
      utils.users.getUsers.invalidate()
      utils.users.getUserStats.invalidate()
      setOpen(false)
      resetForm()
    },
    onError: error => {
      toast.error(`Failed to create user: ${error.message}`)
    },
  })

  const resetForm = () => {
    setFormData({
      email: '',
      fullName: '',
      isAdmin: false,
      adminLevel: 0,
      isActive: true,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const isFormValid = formData.email && formData.fullName
    if (!isFormValid) {
      toast.error('Please fill in the required fields')
      return
    }

    createUser.mutate(formData)
  }

  const handleClose = () => {
    setOpen(false)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            创建用户
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            创建新用户
          </DialogTitle>
          <DialogDescription>
            创建一个新的用户账户。用户将收到邮件通知。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              邮箱地址 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">
              姓名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={e =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="Please enter user name"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>账户状态</Label>
                <p className="text-xs text-muted-foreground">
                  控制用户是否可以登录
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={checked =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>管理员权限</Label>
                <p className="text-xs text-muted-foreground">
                  授予用户管理员权限
                </p>
              </div>
              <Switch
                checked={formData.isAdmin}
                onCheckedChange={checked =>
                  setFormData({
                    ...formData,
                    isAdmin: checked,
                    adminLevel: checked ? 1 : 0,
                  })
                }
              />
            </div>

            {formData.isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="adminLevel">管理员级别</Label>
                <Input
                  id="adminLevel"
                  type="number"
                  min="0"
                  max="2"
                  value={formData.adminLevel}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      adminLevel: Number(e.target.value),
                    })
                  }
                  placeholder="0-2 (0=normal user, 1=administrator, 2=super administrator)"
                />
                <p className="text-xs text-muted-foreground">
                  0: 普通用户 | 1: 管理员 | 2: 超级管理员
                </p>
              </div>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createUser.isPending}
          >
            取消
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={
              createUser.isPending || !formData.email || !formData.fullName
            }
          >
            {createUser.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {createUser.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
