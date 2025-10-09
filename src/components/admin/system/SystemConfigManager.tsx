'use client'

import {
  AlertCircle,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useSystemConfig } from '@/hooks/use-system-config'
import { cn } from '@/lib/utils'

interface SystemConfigManagerProps {
  category: string
}

export function SystemConfigManager({ category }: SystemConfigManagerProps) {
  const {
    getConfigs,
    updateConfig,
    createConfig,
    deleteConfig,
    resetConfigToDefault,
  } = useSystemConfig()

  const {
    data: configs,
    isLoading,
    error,
  } = getConfigs({
    category: category as any,
    includeSecret: false,
  })

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  // 创建新配置的表单状态
  const [newConfig, setNewConfig] = useState({
    key: '',
    value: '',
    description: '',
    dataType: 'string',
    isEditable: true,
    isSecret: false,
  })

  if (isLoading) {
    return <ConfigSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-2">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">加载配置失败</p>
        </div>
      </div>
    )
  }

  const handleUpdateConfig = (config: any, newValue: any) => {
    updateConfig.mutate({
      key: config.key,
      value: newValue,
    })
  }

  const handleCreateConfig = () => {
    createConfig.mutate(
      {
        ...newConfig,
        category: category as any,
        dataType: newConfig.dataType as any,
        value: parseConfigValue(newConfig.value, newConfig.dataType),
      },
      {
        onSuccess: () => {
          setShowCreateDialog(false)
          setNewConfig({
            key: '',
            value: '',
            description: '',
            dataType: 'string',
            isEditable: true,
            isSecret: false,
          })
        },
      }
    )
  }

  const handleDeleteConfig = (configKey: string) => {
    if (confirm('确定要删除这个配置项吗？')) {
      deleteConfig.mutate({ key: configKey })
    }
  }

  const handleResetConfig = (configKey: string) => {
    if (confirm('确定要重置这个配置项到默认值吗？')) {
      resetConfigToDefault.mutate({ key: configKey })
    }
  }

  const parseConfigValue = (value: string, dataType: string) => {
    switch (dataType) {
      case 'number':
        return Number(value)
      case 'boolean':
        return value === 'true'
      case 'json':
      case 'array':
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      default:
        return value
    }
  }

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {category} 配置 ({configs?.length || 0} 项)
        </h3>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新增配置
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新配置</DialogTitle>
              <DialogDescription>
                为 {category} 分类添加新的配置项
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="key">配置键</Label>
                <Input
                  id="key"
                  value={newConfig.key}
                  onChange={e =>
                    setNewConfig({ ...newConfig, key: e.target.value })
                  }
                  placeholder="例如: site.name"
                />
              </div>

              <div>
                <Label htmlFor="dataType">数据类型</Label>
                <Select
                  value={newConfig.dataType}
                  onValueChange={value =>
                    setNewConfig({ ...newConfig, dataType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">字符串</SelectItem>
                    <SelectItem value="number">数字</SelectItem>
                    <SelectItem value="boolean">布尔值</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="array">数组</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value">配置值</Label>
                {newConfig.dataType === 'boolean' ? (
                  <Select
                    value={newConfig.value}
                    onValueChange={value =>
                      setNewConfig({ ...newConfig, value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">是</SelectItem>
                      <SelectItem value="false">否</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Textarea
                    id="value"
                    value={newConfig.value}
                    onChange={e =>
                      setNewConfig({ ...newConfig, value: e.target.value })
                    }
                    placeholder="配置值"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  value={newConfig.description}
                  onChange={e =>
                    setNewConfig({ ...newConfig, description: e.target.value })
                  }
                  placeholder="配置项描述"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newConfig.isSecret}
                  onCheckedChange={checked =>
                    setNewConfig({ ...newConfig, isSecret: checked })
                  }
                />
                <Label>敏感配置</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleCreateConfig}
                disabled={!newConfig.key || createConfig.isPending}
              >
                {createConfig.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                创建
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!configs || configs.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                暂无 {category} 配置
              </p>
              <p className="text-xs text-muted-foreground">
                点击上方按钮创建新配置
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {configs.map((config: any) => (
            <ConfigItem
              key={config.key}
              config={config}
              isSecret={config.isSecret && !showSecrets[config.key]}
              onUpdate={handleUpdateConfig}
              onDelete={handleDeleteConfig}
              onReset={handleResetConfig}
              onToggleSecret={() => toggleSecretVisibility(config.key)}
              isUpdating={updateConfig.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ConfigItemProps {
  config: any
  isSecret: boolean
  onUpdate: (config: any, value: any) => void
  onDelete: (key: string) => void
  onReset: (key: string) => void
  onToggleSecret: () => void
  isUpdating: boolean
}

function ConfigItem({
  config,
  isSecret,
  onUpdate,
  onDelete,
  onReset,
  onToggleSecret,
  isUpdating,
}: ConfigItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  const startEditing = () => {
    setEditValue(formatConfigValue(config.value, config.dataType))
    setIsEditing(true)
  }

  const saveEdit = () => {
    const parsedValue = parseConfigValue(editValue, config.dataType)
    onUpdate(config, parsedValue)
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditValue('')
  }

  const formatConfigValue = (value: any, dataType: string) => {
    if (dataType === 'json' || dataType === 'array') {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  const parseConfigValue = (value: string, dataType: string) => {
    switch (dataType) {
      case 'number':
        return Number(value)
      case 'boolean':
        return value === 'true'
      case 'json':
      case 'array':
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      default:
        return value
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{config.key}</h4>
              <Badge variant="outline">{config.dataType}</Badge>
              {config.isSecret && <Badge variant="destructive">敏感</Badge>}
              {!config.isEditable && <Badge variant="secondary">只读</Badge>}
            </div>

            {config.description && (
              <p className="text-sm text-muted-foreground">
                {config.description}
              </p>
            )}

            <div className="space-y-2">
              {isEditing ? (
                <div className="space-y-2">
                  {config.dataType === 'boolean' ? (
                    <Select value={editValue} onValueChange={setEditValue}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">是</SelectItem>
                        <SelectItem value="false">否</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Textarea
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="font-mono text-sm"
                      rows={
                        config.dataType === 'json' ||
                        config.dataType === 'array'
                          ? 4
                          : 1
                      }
                    />
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit} disabled={isUpdating}>
                      {isUpdating && (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      )}
                      <Save className="w-3 h-3 mr-1" />
                      保存
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <code
                    className={cn(
                      'flex-1 p-2 bg-muted rounded text-sm font-mono',
                      config.dataType === 'json' || config.dataType === 'array'
                        ? 'whitespace-pre-wrap'
                        : ''
                    )}
                  >
                    {isSecret
                      ? '***'
                      : formatConfigValue(config.value, config.dataType)}
                  </code>
                  {config.isSecret && (
                    <Button size="sm" variant="ghost" onClick={onToggleSecret}>
                      {isSecret ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-1 ml-4">
            {config.isEditable && !isEditing && (
              <Button size="sm" variant="ghost" onClick={startEditing}>
                <Edit className="w-4 h-4" />
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onReset(config.key)}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>

            {config.isEditable && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(config.key)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ConfigSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-4 bg-muted rounded w-32" />
                <div className="h-5 bg-muted rounded w-16" />
              </div>
              <div className="h-3 bg-muted rounded w-48" />
              <div className="h-8 bg-muted rounded w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
