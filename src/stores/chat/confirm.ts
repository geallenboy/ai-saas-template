import { create } from 'zustand'
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type TConfirmArgs = {
  message: string;
  onConfirm: () => void;
  title: string;
  onCancel?: () => void;
  cancelTitle?: string;
  actionTitle?: string;
};

export interface ConfirmState {
  // 状态
  isOpen: boolean
  args: TConfirmArgs | null
  
  // 操作方法
  open: (args: TConfirmArgs) => void
  dismiss: () => void
  confirm: () => void
}

/**
 * 确认对话框状态管理
 * 1. 使用 zustand 创建状态管理
 * 2. 使用 devtools 添加开发工具
 * 3. 使用 persist 添加持久化存储
 * 4. 使用 immer 添加状态管理
 * 5. 使用 createJSONStorage 添加持久化存储
 */
export const useConfirmStore = create<ConfirmState>()(
  devtools(
    immer(
      (set, get) => ({
        // 初始状态
        isOpen: false,
        args: null,
        
        // 打开确认对话框
        open: (args: TConfirmArgs) => {
          set({ 
            isOpen: true, 
            args 
          })
        },
        
        // 取消/关闭对话框
        dismiss: () => {
          const { args } = get()
          args?.onCancel?.()
          set({ 
            isOpen: false, 
            args: null 
          })
        },
        
        // 确认操作
        confirm: () => {
          const { args } = get()
          args?.onConfirm()
          set({ 
            isOpen: false, 
            args: null 
          })
        },
        })),
        {
          name: 'confirm-store',
        }
))

// 导出类型以便其他地方使用
export type TConfirmStore = typeof useConfirmStore