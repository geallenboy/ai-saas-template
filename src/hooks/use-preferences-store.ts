import { useEffect } from 'react'
import { usePreferencesStore, TPreferences, TApiKeys, defaultPreferences } from '@/stores/chat/preferences'
import { TBaseModel } from './use-model-list'

// 兼容性 hook，提供与原来的 usePreferenceContext 相同的接口
export const usePreferenceStore = () => {
  const store = usePreferencesStore()
  
  // 确保在组件挂载时初始化数据
  useEffect(() => {
    store.initialize()
  }, [store])
  
  return {
    preferences: store.preferences,
    apiKeys: store.apiKeys,
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    updatePreferences: store.updatePreferences,
    updateApiKey: store.updateApiKey,
    updateApiKeys: store.updateApiKeys,
    resetToDefaults: store.resetToDefaults,
  }
}

// 直接导出 store hook 和相关类型
export { 
  usePreferencesStore, 
  defaultPreferences,
  type TPreferences, 
  type TApiKeys 
}