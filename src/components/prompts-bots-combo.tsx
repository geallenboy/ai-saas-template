import { usePromptsStoreHook } from "@/hooks/use-prompts-store";

import { TPrompt } from "@/hooks/use-prompts-store";
import React, { useState } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import {
  Command as CMDKCommand,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { HugeiconsIcon } from "@hugeicons/react"; 
import { Add01Icon } from "@hugeicons/core-free-icons";


export type TPromptsBotsCombo = {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPromptSelect: (prompt: TPrompt) => void;
  onBack: () => void;
};

export const PromptsBotsCombo = ({
  open,
  children,
  onBack,
  onOpenChange,
  onPromptSelect,
}: TPromptsBotsCombo) => {
  const [commandInput, setCommandInput] = useState("");
  const { open: openPrompts, allPrompts } = usePromptsStoreHook();

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor className="w-full">{children}</PopoverAnchor>
      <PopoverContent
        side="top"
        sideOffset={4}
        className="min-w-[96vw] md:min-w-[700px] lg:min-w-[720px] p-0 rounded-2xl overflow-hidden"
      >
        <CMDKCommand>
          <CommandInput
            placeholder="搜索..."
            className="h-10"
            value={commandInput}
            onValueChange={setCommandInput}
            onKeyDown={(e) => {
              if (
                (e.key === "Delete" || e.key === "Backspace") &&
                !commandInput
              ) {
                onOpenChange(false);
                onBack();
              }
            }}
          />
          <CommandEmpty>No Prompts found.</CommandEmpty>
          <CommandList className="p-2 max-h-[160px]">
            <CommandItem
              onSelect={() => {
                openPrompts("create");
              }}
            >
              <HugeiconsIcon icon={Add01Icon} size={14} className="flex-shrink-0" /> 创建
              新提示词
            </CommandItem>

            {!!allPrompts?.length && (
              <CommandGroup heading="提示词">
                {allPrompts?.map((prompt, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => {
                      onPromptSelect(prompt);
                    }}
                  >
                    {prompt.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </CMDKCommand>
      </PopoverContent>
    </Popover>
  );
};
