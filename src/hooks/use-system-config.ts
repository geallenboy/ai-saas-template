'use client'

import { toast } from 'sonner'
import { trpc } from '@/server/client'

/**
 * 系统配置管理 Hook
 */
export function useSystemConfig() {
  const utils = trpc.useUtils()

  // 获取所有配置
  const getConfigs = trpc.system.getConfigs.useQuery

  // 获取配置分类
  const getCategories = trpc.system.getConfigCategories.useQuery

  // 更新配置
  const updateConfig = trpc.system.updateConfig.useMutation({
    onSuccess: data => {
      toast.success(`配置 "${data?.key}" 更新成功`)
      utils.system.getConfigs.invalidate()
    },
    onError: error => {
      toast.error(`更新配置失败: ${error.message}`)
    },
  })

  // 创建配置
  const createConfig = trpc.system.createConfig.useMutation({
    onSuccess: data => {
      toast.success(`配置 "${data?.key}" 创建成功`)
      utils.system.getConfigs.invalidate()
      utils.system.getConfigCategories.invalidate()
    },
    onError: error => {
      toast.error(`创建配置失败: ${error.message}`)
    },
  })

  // 删除配置
  const deleteConfig = trpc.system.deleteConfig.useMutation({
    onSuccess: () => {
      toast.success('配置删除成功')
      utils.system.getConfigs.invalidate()
    },
    onError: error => {
      toast.error(`删除配置失败: ${error.message}`)
    },
  })

  // 批量更新配置
  const batchUpdateConfigs = trpc.system.batchUpdateConfigs.useMutation({
    onSuccess: data => {
      toast.success(`成功更新 ${data.length} 个配置`)
      utils.system.getConfigs.invalidate()
    },
    onError: error => {
      toast.error(`批量更新失败: ${error.message}`)
    },
  })

  // 重置配置到默认值
  const resetConfigToDefault = trpc.system.resetConfigToDefault.useMutation({
    onSuccess: data => {
      toast.success(`配置 "${data?.key}" 已重置到默认值`)
      utils.system.getConfigs.invalidate()
    },
    onError: error => {
      toast.error(`重置配置失败: ${error.message}`)
    },
  })

  return {
    // 查询
    getConfigs,
    getCategories,

    // 变更操作
    updateConfig,
    createConfig,
    deleteConfig,
    batchUpdateConfigs,
    resetConfigToDefault,

    // 工具函数
    invalidateConfigs: () => utils.system.getConfigs.invalidate(),
  }
}

/**
 * 获取特定分类的配置
 */
export function useSystemConfigByCategory(
  category: string,
  options?: { includeSecret?: boolean }
) {
  return trpc.system.getConfigs.useQuery({
    category: category as any,
    includeSecret: options?.includeSecret ?? false,
  })
}

/**
 * 获取单个配置
 */
export function useSystemConfigByKey(key: string) {
  return trpc.system.getConfigByKey.useQuery({ key })
}
