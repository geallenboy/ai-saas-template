import { useConfirmStore, TConfirmArgs } from "@/stores/chat/confirm";

// 兼容性 hook，提供与原来的 useConfirmProvider 相同的接口
export const useConfirm = () => {
  const { open, dismiss } = useConfirmStore();
  
  return {
    open,
    dismiss
  };
};

// 直接导出 store hook，供需要更多控制的组件使用
export { useConfirmStore, type TConfirmArgs };