"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useConfirmStore } from "@/stores/chat/confirm";

export const ConfirmDialog = () => {
  const { isOpen, args, dismiss, confirm } = useConfirmStore();

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && dismiss()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{args?.title}</AlertDialogTitle>
          {args?.message && (
            <AlertDialogDescription>{args?.message}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={dismiss}>
            {args?.cancelTitle || "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={confirm}>
            {args?.actionTitle || "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};