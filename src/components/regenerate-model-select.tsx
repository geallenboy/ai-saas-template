import { TModelKey, useModelList } from "@/hooks/use-model-list";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tooltip } from "./ui/tooltip";
import { Button } from "./ui/button";
import { ArrowDown01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { Badge } from "./ui/badge";
import { TAssistant } from "@/hooks";
import { HugeiconsIcon } from "@hugeicons/react";

export type TRegenerateModelSelect = {
  assistant: TAssistant;
  onRegenerate: (modelKey: TModelKey) => void;
};

export const RegenerateWithModelSelect = ({
  assistant,
  onRegenerate,
}: TRegenerateModelSelect) => {
  const { assistants, getAssistantByKey } = useModelList();

  const [isOpen, setIsOpen] = useState(false);
  const messageAssistantProps = getAssistantByKey(assistant.key);

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip content="Regenerate">
          <DropdownMenuTrigger asChild>
            {
              <Button variant="ghost" size="sm" rounded="lg">
                <HugeiconsIcon icon={SparklesIcon} size={18} strokeWidth={2} />
                {messageAssistantProps?.model?.name}
                <HugeiconsIcon icon={ArrowDown01Icon} size={16} strokeWidth={2} />
              </Button>
            }
          </DropdownMenuTrigger>
        </Tooltip>

        <DropdownMenuContent className="min-w-[250px] h-[300px] no-scrollbar overflow-y-auto text-sm">
          {assistants.map((assistant) => {
            const assistantProps = getAssistantByKey(assistant.key);

            return (
              <DropdownMenuItem
                key={assistant.key}
                onClick={() => {
                  onRegenerate(assistant.key);
                }}
              >
                {assistantProps?.model.icon("sm")}{" "}
                {assistantProps?.assistant.name}{" "}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
