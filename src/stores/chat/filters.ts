import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { devtools } from "zustand/middleware"; // 开发工具
import { immer } from "zustand/middleware/immer"; // immer 状态管理

export interface FiltersState {
  // UI 状态
  isFilterOpen: boolean
  
  // 操作方法
  open: () => void
  dismiss: () => void
  setIsFilterOpen: (open: boolean) => void
}

/**
 * 过滤器状态管理
 * 1. 使用 zustand 创建状态管理
 * 2. 使用 devtools 添加开发工具
 * 3. 使用 persist 添加持久化存储
 * 4. 使用 immer 添加状态管理
 * 5. 使用 createJSONStorage 添加持久化存储
 */
export const useFiltersStore = create<FiltersState>()(
  devtools(
    persist(
      immer(
        (set) => ({
          // 初始状态
          isFilterOpen: false,
          
          // 操作方法
          open: () => {
            set({ isFilterOpen: true })
          },
          
          dismiss: () => {
            set({ isFilterOpen: false })
          },
          
          setIsFilterOpen: (open: boolean) => {
            set({ isFilterOpen: open })
          },
        }),
      ),
      {
        name: 'ai-chat-filters', // 本地存储的键名
        storage: createJSONStorage(() => localStorage),
        // 不持久化任何状态，因为过滤器对话框的开关状态不需要保存
        partialize: () => ({}),
      }
    )
  )
)

// 导出类型以便其他地方使用
export type TFiltersStore = typeof useFiltersStore