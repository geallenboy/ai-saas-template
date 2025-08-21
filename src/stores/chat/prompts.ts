import { create } from 'zustand'
import { devtools } from "zustand/middleware"; // 开发工具
import { immer } from "zustand/middleware/immer"; // immer 状态管理
import { get as idbGet, set as idbSet } from "idb-keyval"
import { v4 } from "uuid"
import axios from "axios"

export type TPrompt = {
  id: string
  name: string
  content: string
}

export interface PromptsState {
  // UI 状态
  isPromptOpen: boolean
  showCreatePrompt: boolean
  tab: "public" | "local"
  editablePrompt: TPrompt | undefined
  
  // 数据状态
  localPrompts: TPrompt[]
  publicPrompts: TPrompt[]
  allPrompts: TPrompt[]
  isLoading: boolean
  isInitialized: boolean
  
  // UI 操作方法
  open: (action?: "public" | "local" | "create") => void
  dismiss: () => void
  setShowCreatePrompt: (show: boolean) => void
  setTab: (tab: "public" | "local") => void
  setEditablePrompt: (prompt: TPrompt | undefined) => void
  
  // 数据操作方法
  loadLocalPrompts: () => Promise<void>
  loadPublicPrompts: () => Promise<void>
  createPrompt: (prompt: Omit<TPrompt, "id">) => Promise<void>
  updatePrompt: (id: string, prompt: Partial<Omit<TPrompt, "id">>) => Promise<void>
  deletePrompt: (id: string) => Promise<void>
  initialize: () => Promise<void>
}

// 全局初始化标记，防止多次初始化
let isInitializing = false

export const usePromptsStore = create<PromptsState>()(
  devtools(
    immer(
      (set, get) => ({
        // 初始状态
        isPromptOpen: false,
        showCreatePrompt: false,
        tab: "public",
        editablePrompt: undefined,
        
        localPrompts: [],
        publicPrompts: [],
        allPrompts: [],
        isLoading: false,
        isInitialized: false,
        
        // UI 操作方法
        open: (action?: "public" | "local" | "create") => {
          if (action === "create") {
            set({ showCreatePrompt: true })
          } else if (action) {
            set({ tab: action })
          }
          set({ isPromptOpen: true })
          
          // 确保数据已加载，使用全局标记防止重复初始化
          if (!get().isInitialized && !isInitializing) {
            isInitializing = true
            get().initialize().finally(() => {
              isInitializing = false
            })
          }
        },
        
        dismiss: () => {
          set({ isPromptOpen: false })
        },
        
        setShowCreatePrompt: (show: boolean) => {
          set({ showCreatePrompt: show })
          if (!show) {
            set({ tab: "local" })
          }
        },
        
        setTab: (tab: "public" | "local") => {
          set({ tab })
        },
        
        setEditablePrompt: (prompt: TPrompt | undefined) => {
          set({ editablePrompt: prompt })
        },
        
        // 数据操作方法
        loadLocalPrompts: async () => {
          try {
            set({ isLoading: true })
            const prompts = await idbGet("prompts") || []
            const { publicPrompts } = get()
            set({ 
              localPrompts: prompts,
              allPrompts: [...prompts, ...publicPrompts]
            })
          } catch (error) {
            console.error('Failed to load local prompts:', error)
          } finally {
            set({ isLoading: false })
          }
        },
        
        loadPublicPrompts: async () => {
          try {
            set({ isLoading: true })
            const response = await axios.get('/api/prompts')
            const publicPrompts = response.data.prompts || []
            const { localPrompts } = get()
            set({ 
              publicPrompts,
              allPrompts: [...localPrompts, ...publicPrompts]
            })
          } catch (error) {
            console.error('Failed to load public prompts:', error)
          } finally {
            set({ isLoading: false })
          }
        },
        
        createPrompt: async (prompt: Omit<TPrompt, "id">) => {
          try {
            const newPrompt = { id: v4(), ...prompt }
            const currentPrompts = get().localPrompts
            const updatedPrompts = [...currentPrompts, newPrompt]
            
            // 更新本地状态
            const { publicPrompts } = get()
            set({ 
              localPrompts: updatedPrompts,
              allPrompts: [...updatedPrompts, ...publicPrompts]
            })
            
            // 保存到 IndexedDB
            await idbSet("prompts", updatedPrompts)
          } catch (error) {
            console.error('Failed to create prompt:', error)
            // 失败时重新加载数据
            await get().loadLocalPrompts()
          }
        },
        
        updatePrompt: async (id: string, prompt: Partial<Omit<TPrompt, "id">>) => {
          try {
            const currentPrompts = get().localPrompts
            const updatedPrompts = currentPrompts.map(p => 
              p.id === id ? { ...p, ...prompt } : p
            )
            
            // 更新本地状态
            const { publicPrompts } = get()
            set({ 
              localPrompts: updatedPrompts,
              allPrompts: [...updatedPrompts, ...publicPrompts]
            })
            
            // 保存到 IndexedDB
            await idbSet("prompts", updatedPrompts)
          } catch (error) {
            console.error('Failed to update prompt:', error)
            // 失败时重新加载数据
            await get().loadLocalPrompts()
          }
        },
        
        deletePrompt: async (id: string) => {
          try {
            const currentPrompts = get().localPrompts
            const updatedPrompts = currentPrompts.filter(prompt => prompt.id !== id)
            
            // 更新本地状态
            const { publicPrompts } = get()
            set({ 
              localPrompts: updatedPrompts,
              allPrompts: [...updatedPrompts, ...publicPrompts]
            })
            
            // 保存到 IndexedDB
            await idbSet("prompts", updatedPrompts)
          } catch (error) {
            console.error('Failed to delete prompt:', error)
            // 失败时重新加载数据
            await get().loadLocalPrompts()
          }
        },
        
        // 初始化数据
        initialize: async () => {
          if (get().isInitialized) return
          
          await Promise.all([
            get().loadLocalPrompts(),
            get().loadPublicPrompts()
          ])
          
          set({ isInitialized: true })
        },
      })
    ),
    {
      name: 'prompts-store',
    }
  )
)

// 导出类型以便其他地方使用
export type TPromptsStore = typeof usePromptsStore