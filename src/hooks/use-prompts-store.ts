import { usePromptsStore, TPrompt } from '@/stores/chat/prompts'

// 兼容性 hook，提供与原来的 usePromptsContext 相同的接口
export const usePromptsStoreHook = () => {
  const {
    open,
    dismiss,
    allPrompts,
    isPromptOpen,
    showCreatePrompt,
    tab,
    editablePrompt,
    localPrompts,
    publicPrompts,
    isLoading,
    isInitialized,
    setShowCreatePrompt,
    setTab,
    setEditablePrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
  } = usePromptsStore()
  
  return {
    // UI 状态和方法
    open,
    dismiss,
    allPrompts,
    
    // 额外提供的状态和方法（如果需要更多控制）
    isPromptOpen,
    showCreatePrompt,
    tab,
    editablePrompt,
    localPrompts,
    publicPrompts,
    isLoading,
    isInitialized,
    
    // 操作方法
    setShowCreatePrompt,
    setTab,
    setEditablePrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
  }
}

// 直接导出 store hook 和相关类型
export { 
  usePromptsStore, 
  type TPrompt 
}