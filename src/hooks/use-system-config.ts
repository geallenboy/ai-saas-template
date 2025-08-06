'use client'

import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

/**
 * System configuration management Hook
 */
export function useSystemConfig() {
  const utils = trpc.useUtils()

  // Get all configurations
  const getConfigs = trpc.system.getConfigs.useQuery

  // Get configuration categories
  const getCategories = trpc.system.getConfigCategories.useQuery

  // Update configuration
  const updateConfig = trpc.system.updateConfig.useMutation({
    onSuccess: data => {
      toast.success(`Configuration "${data?.key}" updated successfully`)
      utils.system.getConfigs.invalidate()
    },
    onError: error => {
      toast.error(`Failed to update configuration: ${error.message}`)
    },
  })

  // Create configuration
  const createConfig = trpc.system.createConfig.useMutation({
    onSuccess: data => {
      toast.success(`Configuration "${data?.key}" created successfully`)
      utils.system.getConfigs.invalidate()
      utils.system.getConfigCategories.invalidate()
    },
    onError: error => {
      toast.error(`Failed to create configuration: ${error.message}`)
    },
  })

  // Delete configuration
  const deleteConfig = trpc.system.deleteConfig.useMutation({
    onSuccess: () => {
      toast.success('Configuration deleted successfully')
      utils.system.getConfigs.invalidate()
    },
    onError: error => {
      toast.error(`Failed to delete configuration: ${error.message}`)
    },
  })

  // Batch update configurations
  const batchUpdateConfigs = trpc.system.batchUpdateConfigs.useMutation({
    onSuccess: data => {
      toast.success(`Successfully updated ${data.length} configurations`)
      utils.system.getConfigs.invalidate()
    },
    onError: error => {
      toast.error(`Failed to batch update configurations: ${error.message}`)
    },
  })

  // Reset configuration to default
  const resetConfigToDefault = trpc.system.resetConfigToDefault.useMutation({
    onSuccess: data => {
      toast.success(`Configuration "${data?.key}" reset to default value`)
      utils.system.getConfigs.invalidate()
    },
    onError: error => {
      toast.error(`Failed to reset configuration: ${error.message}`)
    },
  })

  return {
    // Query
    getConfigs,
    getCategories,

    // Mutation
    updateConfig,
    createConfig,
    deleteConfig,
    batchUpdateConfigs,
    resetConfigToDefault,

    // Utility functions
    invalidateConfigs: () => utils.system.getConfigs.invalidate(),
  }
}

/**
 * Get configurations by specific category
 */
export function useSystemConfigByCategory(category: string) {
  return trpc.system.getConfigs.useQuery({
    category: category as any,
    includeSecret: false,
  })
}

/**
 * Get a single configuration
 */
export function useSystemConfigByKey(key: string) {
  return trpc.system.getConfigByKey.useQuery({ key })
}
