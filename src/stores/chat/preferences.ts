import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { devtools } from "zustand/middleware"; // 开发工具
import { immer } from "zustand/middleware/immer"; // immer 状态管理
import { get as idbGet, set as idbSet } from "idb-keyval"
import { TBaseModel } from "@/hooks/use-model-list"
import { TToolKey } from "@/hooks/use-tools"
import { TAssistant } from "@/hooks/use-chat-session"

export type TApiKeys = Partial<Record<TBaseModel, string>>

export type TPreferences = {
  defaultAssistant: TAssistant["key"]
  systemPrompt: string
  messageLimit: number
  temperature: number
  maxTokens: number
  topP: number
  topK: number
  googleSearchEngineId?: string
  googleSearchApiKey?: string
  defaultPlugins: TToolKey[]
  whisperSpeechToTextEnabled: boolean
  defaultWebSearchEngine: "google" | "duckduckgo"
  ollamaBaseUrl: string
  memories: string[]
}

export const defaultPreferences: TPreferences = {
  defaultAssistant: "gpt-3.5-turbo",
  systemPrompt: "You're helpful assistant that can help me with my questions.",
  messageLimit: 30,
  temperature: 0.5,
  maxTokens: 1000,
  topP: 1.0,
  topK: 5,
  defaultPlugins: [],
  whisperSpeechToTextEnabled: false,
  defaultWebSearchEngine: "duckduckgo",
  ollamaBaseUrl: "http://localhost:11434",
  memories: [],
}

export interface PreferencesState {
  // 数据状态
  preferences: TPreferences
  apiKeys: TApiKeys
  isLoading: boolean
  isInitialized: boolean
  
  // 操作方法
  updatePreferences: (
    newPreferences: Partial<TPreferences>,
    onSuccess?: (preference: TPreferences) => void
  ) => Promise<void>
  updateApiKey: (key: TBaseModel, value: string) => Promise<void>
  updateApiKeys: (newApiKeys: TApiKeys) => void
  resetToDefaults: () => Promise<void>
  loadPreferences: () => Promise<void>
  loadApiKeys: () => Promise<void>
  initialize: () => Promise<void>
}

export const usePreferencesStore = create<PreferencesState>()(
  devtools(
    persist(
      immer(
      (set, get) => ({
        // 初始状态
        preferences: defaultPreferences,
        apiKeys: {},
        isLoading: false,
        isInitialized: false,
        
        // 加载偏好设置
        loadPreferences: async () => {
          try {
            set({ isLoading: true })
            const storedPreferences = await idbGet("preferences")
            if (storedPreferences && typeof storedPreferences === 'object') {
              set({ 
                preferences: { ...defaultPreferences, ...storedPreferences as Partial<TPreferences> }
              })
            }
          } catch (error) {
            console.error('Failed to load preferences:', error)
          } finally {
            set({ isLoading: false })
          }
        },
        
        // 加载API密钥
        loadApiKeys: async () => {
          try {
            const storedApiKeys = await idbGet("api-keys")
            if (storedApiKeys && typeof storedApiKeys === 'object') {
              set({ apiKeys: storedApiKeys as TApiKeys })
            }
          } catch (error) {
            console.error('Failed to load API keys:', error)
          }
        },
        
        // 初始化数据
        initialize: async () => {
          if (get().isInitialized) return
          
          await Promise.all([
            get().loadPreferences(),
            get().loadApiKeys()
          ])
          
          // 设置默认的 ollama API key（保持原有逻辑）
          const { apiKeys, updateApiKey } = get()
          if (!apiKeys.ollama) {
            await updateApiKey("ollama", "dsdsdsdsds")
          }
          
          set({ isInitialized: true })
        },
        
        // 更新偏好设置
        updatePreferences: async (
          newPreferences: Partial<TPreferences>,
          onSuccess?: (preference: TPreferences) => void
        ) => {
          try {
            const currentPreferences = get().preferences
            const updatedPreferences = { ...currentPreferences, ...newPreferences }
            
            // 更新本地状态
            set({ preferences: updatedPreferences })
            
            // 保存到 IndexedDB
            await idbSet("preferences", updatedPreferences)
            
            // 执行成功回调
            onSuccess?.(updatedPreferences)
          } catch (error) {
            console.error('Failed to update preferences:', error)
            // 失败时回滚状态
            set({ preferences: get().preferences })
          }
        },
        
        // 更新单个API密钥
        updateApiKey: async (key: TBaseModel, value: string) => {
          try {
            const currentApiKeys = get().apiKeys
            const updatedApiKeys = { ...currentApiKeys, [key]: value }
            
            // 更新本地状态
            set({ apiKeys: updatedApiKeys })
            
            // 保存到 IndexedDB
            await idbSet("api-keys", updatedApiKeys)
          } catch (error) {
            console.error('Failed to update API key:', error)
            // 失败时回滚状态
            set({ apiKeys: get().apiKeys })
          }
        },
        
        // 批量更新API密钥
        updateApiKeys: (newApiKeys: TApiKeys) => {
          set({ apiKeys: newApiKeys })
        },
        
        // 重置为默认设置
        resetToDefaults: async () => {
          try {
            set({ preferences: defaultPreferences })
            await idbSet("preferences", defaultPreferences)
          } catch (error) {
            console.error('Failed to reset to defaults:', error)
          }
        },
      })),
      {
        name: 'ai-chat-preferences',
        storage: createJSONStorage(() => localStorage),
        // 不持久化到 localStorage，因为我们使用 IndexedDB
        // 只持久化初始化状态以避免重复初始化
        partialize: (state) => ({ 
          isInitialized: state.isInitialized 
        }),
      }
    ),
    {
      name: 'preferences-store',
    }
  )
)

// 导出类型以便其他地方使用
export type TPreferencesStore = typeof usePreferencesStore