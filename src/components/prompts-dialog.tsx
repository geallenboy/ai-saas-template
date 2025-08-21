"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CreatePrompt } from "@/components/prompts/create-prompt";
import { PromptLibrary } from "@/components/prompts/prompt-library";
import { usePromptsStore } from "@/stores/chat/prompts";
import { useChatContext } from "@/context/chat";

export const PromptsDialog = () => {
  const {
    isPromptOpen,
    showCreatePrompt,
    tab,
    editablePrompt,
    localPrompts,
    publicPrompts,
    dismiss,
    setShowCreatePrompt,
    setTab,
    setEditablePrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
  } = usePromptsStore();
  
  const { editor } = useChatContext();

  return (
    <Dialog open={isPromptOpen} onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="w-[96dvw] max-h-[80dvh] rounded-2xl md:w-[600px] gap-0 md:max-h-[600px] flex flex-col overflow-hidden border border-white/5 p-0">
        {showCreatePrompt ? (
          <CreatePrompt
            prompt={editablePrompt}
            open={showCreatePrompt}
            onOpenChange={(isOpen) => {
              setShowCreatePrompt(isOpen);
              if (!isOpen) {
                setTab("local");
              }
            }}
            onCreatePrompt={async (prompt) => {
              await createPrompt(prompt);
              setShowCreatePrompt(false);
              setTab("local");
            }}
            onUpdatePrompt={async (prompt) => {
              if (editablePrompt?.id) {
                await updatePrompt(editablePrompt.id, prompt);
                setShowCreatePrompt(false);
                setTab("local");
              }
            }}
          />
        ) : (
          <PromptLibrary
            open={!showCreatePrompt}
            tab={tab}
            onTabChange={setTab}
            onCreate={() => {
              setEditablePrompt(undefined);
              setShowCreatePrompt(true);
            }}
            onPromptSelect={(prompt) => {
              editor?.commands?.clearContent();
              editor?.commands?.setContent(prompt.content);
              editor?.commands?.focus("end");
              dismiss();
            }}
            localPrompts={localPrompts}
            publicPrompts={publicPrompts}
            onEdit={(prompt) => {
              setEditablePrompt(prompt);
              setShowCreatePrompt(true);
            }}
            onDelete={(prompt) => deletePrompt(prompt.id)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};