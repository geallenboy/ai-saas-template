import {
  useSessionsContext,
} from "@/context";
import { useSettingsStore } from "@/stores/chat/settings";
import { usePromptsStoreHook } from "@/hooks/use-prompts-store";
import {
  Moon02Icon,
  MoreHorizontalIcon,
  NoteIcon,
  PlusSignIcon,
  Settings03Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";
import { useState } from "react";
import { HistorySidebar } from "../history/history-side-bar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Flex } from "../ui/flex";
import { Tooltip } from "../ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { open: openSettings } = useSettingsStore();
  const { open: openPrompts } = usePromptsStoreHook();
  const [isOpen, setIsOpen] = useState(false);
  const { createSession } = useSessionsContext();

  const renderNewSession = () => {
    return (
      <Tooltip content="新会话" side="left" sideOffset={4}>
        <Button
          size="icon"
          variant={"ghost"}
          className="min-w-8 h-8"
          onClick={() => {
            createSession({
              redirect: true,
            });
          }}
        >
          <HugeiconsIcon icon={PlusSignIcon} size={20} strokeWidth={2} />{" "}
        </Button>
      </Tooltip>
    );
  };

  return (
    <div className="absolute z-[50] flex flex-col  justify-center items-center gap-3 pb-6 md:p-3 top-0 bottom-0 left-0 border-r border-zinc-50 dark:border-white/5">
      <div className="flex flex-row gap-2 items-center">
        {renderNewSession()}
      </div>

      <div className="flex flex-col gap-2 items-center">
        <HistorySidebar />
      </div>
      <Tooltip content="提示词" side="left" sideOffset={4}>
        <Button
          size="iconSm"
          variant="ghost"
          onClick={() => {
            openPrompts();
          }}
        >
          <HugeiconsIcon icon={NoteIcon} size={20} strokeWidth={2} />
        </Button>
      </Tooltip>
      <Flex className="flex-1" />
      <Tooltip content="偏好设置" side="left" sideOffset={4}>
        <Button
          size="iconSm"
          variant="ghost"
          onClick={() => {
            openSettings();
          }}
        >
          <HugeiconsIcon icon={Settings03Icon} size={20} strokeWidth={2} />
        </Button>
      </Tooltip>
      <DropdownMenu
        open={isOpen}
        onOpenChange={(open) => {
          document.body.style.pointerEvents = "auto";
          setIsOpen(open);
        }}
      >
        <Tooltip content="更多" side="left" sideOffset={4}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="iconSm">
              <HugeiconsIcon icon={MoreHorizontalIcon} size={20} strokeWidth={2} />
            </Button>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent
          className="min-w-[250px] text-sm md:text-base mr-2"
          align="end"
          side="left"
          sideOffset={4}
        >
          <DropdownMenuItem onClick={() => {}}>关于</DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>反馈</DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>支持</DropdownMenuItem>
          <div className="my-1 h-[1px] bg-black/10 dark:bg-white/10 w-full" />

          <DropdownMenuItem
            onClick={() => {
              setTheme(theme === "light" ? "dark" : "light");
            }}
          >
            {theme === "light" ? (
              <HugeiconsIcon icon={Moon02Icon} size={18} strokeWidth={2} />
            ) : (
              <HugeiconsIcon icon={Sun01Icon} size={18} strokeWidth={2} />
            )}
            切换到{theme === "light" ? "深色" : "浅色"}模式
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
