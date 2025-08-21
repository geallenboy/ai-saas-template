import { useChatContext } from "@/context/chat";
import { TPrompt } from "@/hooks/use-prompts-store";
import { Edit02Icon, NoteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreHorizontalIcon, Edit02Icon as EditIcon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export type TPromptLibrary = {
  open: boolean;
  onPromptSelect: (prompt: TPrompt) => void;
  tab: "public" | "local";
  publicPrompts: TPrompt[];
  localPrompts: TPrompt[];
  onEdit: (prompt: TPrompt) => void;
  onDelete: (prompt: TPrompt) => void;
  onTabChange: (tab: "public" | "local") => void;
  onCreate: () => void;
};

export const PromptLibrary = ({
  open,
  onPromptSelect,
  tab,
  localPrompts,
  publicPrompts,
  onCreate,
  onTabChange,
  onEdit,
  onDelete,
}: TPromptLibrary) => {
  const { editor } = useChatContext();

  return (
    <Command>
      <div className="w-full p-1">
        <CommandInput placeholder="搜索提示词" />
      </div>

      <div className="flex flex-col w-full relative h-full">
        <CommandEmpty className="text-sm text-zinc-500 w-full flex flex-col items-center justify-center gap-2 p-4">
          No prompts found
          <Button variant="outline" size="sm" onClick={onCreate}>
            Create new prompt
          </Button>
        </CommandEmpty>

        <CommandList className="px-2 pb-2">
          <CommandItem
            value={"Create prompt"}
            className="w-full"
            onSelect={onCreate}
          >
            <HugeiconsIcon icon={Edit02Icon} size={18} strokeWidth={2} />
            Create Prompt
          </CommandItem>
          <CommandGroup heading="Prompts Collections">
            {[...localPrompts, ...publicPrompts]?.map((prompt) => (
              <CommandItem
                value={prompt.name}
                key={prompt.id}
                className="w-full"
                onSelect={() => {
                  onPromptSelect(prompt);
                }}
              >
                <HugeiconsIcon icon={NoteIcon} size={20} strokeWidth={2} />
                {prompt.name}
                {tab === "local" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="iconSm">
                        <HugeiconsIcon icon={MoreHorizontalIcon} size={24} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="min-w-[200px] text-sm md:text-base"
                      align="end"
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          onEdit(prompt);
                          e.stopPropagation();
                        }}
                      >
                        <HugeiconsIcon icon={EditIcon} size={14} />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          onDelete(prompt);
                          e.stopPropagation();
                        }}
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={14} />
                          删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </div>
    </Command>
  );
};
