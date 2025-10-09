'use client'

import { Loader2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
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
import { trpc } from '@/server/client'

interface CreateUserDialogProps {
  children?: React.ReactNode
}

export function CreateUserDialog({ children }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    isAdmin: false,
    adminLevel: 0,
    isActive: true,
  })

  const utils = trpc.useUtils()

  const createUser = trpc.users.createUser.useMutation({
    onSuccess: (data: any) => {
      toast.success(`用户 "${data.fullName}" 创建成功`)
      utils.users.getUsers.invalidate()
      utils.users.getUserStats.invalidate()
      setOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.error(`创建用户失败: ${error.message}`)
    },
  })

  const resetForm = () => {
    setFormData({
      email: '',
      fullName: '',
      password: '',
      isAdmin: false,
      adminLevel: 0,
      isActive: true,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const isFormValid = formData.email && formData.fullName
    if (!isFormValid) {
      toast.error('请填写必填字段')
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
              placeholder="请输入用户姓名"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              密码 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={e =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="请输入密码（至少6位）"
              required
              minLength={6}
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
                  placeholder="0-2 (0=普通用户, 1=管理员, 2=超级管理员)"
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
            {createUser.isPending ? '创建中...' : '创建用户'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
