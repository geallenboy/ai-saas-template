import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'  // 持久化存储
import { devtools } from "zustand/middleware"; // 开发工具
import { immer } from "zustand/middleware/immer"; // immer 状态管理

/**
 * 设置状态管理
 * 1. 使用 zustand 创建状态管理
 * 2. 使用 devtools 添加开发工具
 * 3. 使用 persist 添加持久化存储
 * 4. 使用 immer 添加状态管理
 * 5. 使用 createJSONStorage 添加持久化存储
 */
export interface SettingsState {
  // UI 状态
  isSettingOpen: boolean
  selectedMenu: string
  
  // 操作方法
  open: (menu?: string) => void
  dismiss: () => void
  setSelectedMenu: (menu: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      immer((set) => ({
          // 初始状态
          isSettingOpen: false,
          selectedMenu: 'common',
          
          // 操作方法
          open: (key?: string) => {
            set({ 
              isSettingOpen: true, 
              selectedMenu: key || 'common' 
            })
          },
          
          dismiss: () => {
            set({ isSettingOpen: false })
          },
          
          setSelectedMenu: (menu: string) => {
            set({ selectedMenu: menu })
          },
        }),
            
      ),
      {
        name: 'settings-store', 
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ 
          selectedMenu: state.selectedMenu 
        }),
      }
    ),
    {
      name: 'settings-store', 
    }
  )
)
// 导出类型以便其他地方使用
export type TSettingsStore = typeof useSettingsStore