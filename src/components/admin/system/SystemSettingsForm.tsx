'use client'

import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Save,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  useSystemConfig,
  useSystemConfigByCategory,
} from '@/hooks/use-system-config'
import { cn } from '@/lib/utils'

export type SettingFieldType = 'string' | 'text' | 'number' | 'boolean' | 'json'

export interface SystemSettingField {
  key: string
  label: string
  description?: string
  type?: SettingFieldType
  placeholder?: string
  helperText?: string
  defaultValue?: string | number | boolean
  secret?: boolean
  isEditable?: boolean
}

interface SystemSettingsFormProps {
  category: string
  title: string
  description?: string
  fields: SystemSettingField[]
}

export function SystemSettingsForm({
  category,
  title,
  description,
  fields,
}: SystemSettingsFormProps) {
  const {
    updateConfig,
    createConfig,
    resetConfigToDefault,
    invalidateConfigs,
  } = useSystemConfig()

  const {
    data: configs = [],
    isLoading,
    error,
  } = useSystemConfigByCategory(category, { includeSecret: true })

  const configMap = useMemo(() => {
    return new Map(configs.map(config => [config.key, config]))
  }, [configs])

  const initialValues = useMemo(() => {
    const initial: Record<string, string | number | boolean> = {}
    fields.forEach(field => {
      const config = configMap.get(field.key)
      const type = field.type ?? 'string'
      const defaultValue =
        field.defaultValue ?? (type === 'boolean' ? false : '')

      if (!config) {
        initial[field.key] = defaultValue as any
        return
      }

      const value = config.value

      if (type === 'boolean') {
        initial[field.key] = Boolean(value)
      } else if (type === 'number') {
        initial[field.key] = Number(value ?? 0)
      } else if (type === 'text' || type === 'json') {
        if (typeof value === 'string') {
          initial[field.key] = value
        } else {
          initial[field.key] = JSON.stringify(value ?? '', null, 2)
        }
      } else {
        initial[field.key] = (value ?? '') as any
      }
    })

    return initial
  }, [configMap, fields])

  const [formValues, setFormValues] =
    useState<Record<string, string | number | boolean>>(initialValues)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setFormValues(initialValues)
  }, [initialValues])

  const parseValueByType = (value: any, type: SettingFieldType) => {
    switch (type) {
      case 'boolean':
        return Boolean(value)
      case 'number':
        return Number(value)
      case 'json':
        if (typeof value === 'string') {
          try {
            return JSON.parse(value)
          } catch {
            return value
          }
        }
        return value
      default:
        return value ?? ''
    }
  }

  const handleSave = async (field: SystemSettingField) => {
    const type = field.type ?? 'string'
    const currentValue = formValues[field.key]
    const parsedValue = parseValueByType(currentValue, type)
    const config = configMap.get(field.key)

    try {
      setSavingKey(field.key)
      if (config) {
        await updateConfig.mutateAsync({
          key: field.key,
          value: parsedValue,
        })
      } else {
        await createConfig.mutateAsync({
          key: field.key,
          value: parsedValue,
          description: field.description,
          category: category as any,
          dataType: mapFieldTypeToConfig(type),
          isEditable: field.isEditable ?? true,
          isSecret: field.secret ?? false,
        })
      }
      await invalidateConfigs()
    } finally {
      setSavingKey(null)
    }
  }

  const handleReset = async (field: SystemSettingField) => {
    if (!configMap.get(field.key)) return
    if (!confirm(`确定要重置 ${field.label} 吗？`)) return
    setSavingKey(field.key)
    try {
      await resetConfigToDefault.mutateAsync({ key: field.key })
      await invalidateConfigs()
    } finally {
      setSavingKey(null)
    }
  }

  const renderFieldControl = (field: SystemSettingField) => {
    const type = field.type ?? 'string'
    const value = formValues[field.key]
    const onChangeString = (val: string) =>
      setFormValues(prev => ({ ...prev, [field.key]: val }))

    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.key}
              checked={Boolean(value)}
              onCheckedChange={checked =>
                setFormValues(prev => ({ ...prev, [field.key]: checked }))
              }
              disabled={savingKey === field.key}
            />
            <Label
              htmlFor={field.key}
              className="text-sm text-muted-foreground"
            >
              {value ? '已启用' : '已关闭'}
            </Label>
          </div>
        )
      case 'number':
        return (
          <Input
            id={field.key}
            type="number"
            value={value as number}
            disabled={savingKey === field.key}
            onChange={event =>
              setFormValues(prev => ({
                ...prev,
                [field.key]: Number(event.target.value),
              }))
            }
            placeholder={field.placeholder}
          />
        )
      case 'text':
        return (
          <Textarea
            id={field.key}
            value={(value as string) ?? ''}
            disabled={savingKey === field.key}
            onChange={event => onChangeString(event.target.value)}
            placeholder={field.placeholder}
            className="min-h-[120px]"
          />
        )
      case 'json':
        return (
          <Textarea
            id={field.key}
            value={(value as string) ?? ''}
            disabled={savingKey === field.key}
            onChange={event => onChangeString(event.target.value)}
            placeholder={field.placeholder ?? '{ "key": "value" }'}
            className="font-mono text-sm min-h-[160px]"
          />
        )
      default:
        return (
          <div className="relative">
            <Input
              id={field.key}
              type={
                field.secret && !showSecret[field.key] ? 'password' : 'text'
              }
              value={(value as string) ?? ''}
              disabled={savingKey === field.key}
              onChange={event => onChangeString(event.target.value)}
              placeholder={field.placeholder}
            />
            {field.secret && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() =>
                  setShowSecret(prev => ({
                    ...prev,
                    [field.key]: !prev[field.key],
                  }))
                }
              >
                {showSecret[field.key] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                <div className="h-10 w-full rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium">无法加载配置</p>
              <p className="text-xs text-destructive/70">{error.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map(field => {
          const type = field.type ?? 'string'
          const config = configMap.get(field.key)
          const saving = savingKey === field.key
          const hasChanged = !config
            ? formValues[field.key] !== (field.defaultValue ?? '')
            : type === 'boolean'
              ? formValues[field.key] !== Boolean(config.value)
              : type === 'number'
                ? Number(formValues[field.key]) !== Number(config.value)
                : String(formValues[field.key] ?? '') !==
                  String(config.value ?? '')

          return (
            <div key={field.key} className="space-y-2 border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor={field.key} className="text-base">
                    {field.label}
                    {field.secret && (
                      <span className="ml-2 text-xs font-medium text-orange-600">
                        敏感信息
                      </span>
                    )}
                  </Label>
                  {field.description && (
                    <p className="text-sm text-muted-foreground">
                      {field.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {config && (
                    <button
                      type="button"
                      className={cn(
                        'inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground',
                        saving && 'opacity-50'
                      )}
                      onClick={() => handleReset(field)}
                      disabled={saving}
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> 重置
                    </button>
                  )}
                  <button
                    type="button"
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium',
                      hasChanged
                        ? 'border-primary/40 text-primary'
                        : 'border-muted-foreground/20 text-muted-foreground'
                    )}
                    onClick={() => handleSave(field)}
                    disabled={saving || (!hasChanged && !!config)}
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    保存
                  </button>
                </div>
              </div>

              {renderFieldControl(field)}

              {field.helperText && (
                <p className="text-xs text-muted-foreground">
                  {field.helperText}
                </p>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function mapFieldTypeToConfig(type: SettingFieldType): any {
  switch (type) {
    case 'boolean':
      return 'boolean'
    case 'number':
      return 'number'
    case 'json':
      return 'json'
    default:
      return 'string'
  }
}
