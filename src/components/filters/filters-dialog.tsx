"use client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
  
import moment from "moment";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useModelList } from "@/hooks/use-model-list";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { sortSessions } from "@/lib/helper";
import {
  CommentAdd01Icon,
  Delete01Icon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";

import { useSessionsContext } from "@/context/sessions";
import { HugeiconsIcon } from "@hugeicons/react";
import { useFiltersStore } from "@/stores/chat/filters";

export const FiltersDialog = () => {
  const {
    sessions,
    createSession,
    clearSessionsMutation,
    removeSessionMutation,
    currentSession,
    refetchSessions,
  } = useSessionsContext();

  const router = useRouter();
  const { isFilterOpen, open, dismiss, setIsFilterOpen } = useFiltersStore();
  const { theme, setTheme } = useTheme();
  const { getModelByKey, getAssistantByKey } = useModelList();
  const { toast, dismiss: dismissToast } = useToast();

  const onClose = () => setIsFilterOpen(false);

  // 键盘快捷键监听
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsFilterOpen(!isFilterOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isFilterOpen, setIsFilterOpen]);

  // 重写 open 方法以包含 refetchSessions
  const handleOpen = () => {
    refetchSessions?.();
    open();
  };

  const actions = [
    {
      name: "新建会话",
      icon: CommentAdd01Icon,
      action: () => {
        createSession({
          redirect: true,
        });
        onClose();
      },
    },
    {
      name: `切换到${theme === "light" ? "深色" : "浅色"}模式`,
      icon: theme === "light" ? Moon02Icon : Sun03Icon,
      action: () => {
        setTheme(theme === "light" ? "dark" : "light");
        onClose();
      },
    },
    {
      name: "删除当前会话",
      icon: Delete01Icon,
      action: () => {
        onClose();
        toast({
          title: "删除会话？",
          description: "此操作无法撤销。",
          variant: "destructive",
          action: (
            <Button
              size={"sm"}
              variant={"default"}
              onClick={() => {
                currentSession?.id &&
                  removeSessionMutation.mutate(currentSession?.id, {
                    onSuccess() {
                      createSession({
                        redirect: true,
                      });
                      dismissToast();
                    },
                  });
              }}
            >
              删除
            </Button>
          ),
        });
      },
    },
  ];

  return (
    <CommandDialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <CommandInput placeholder="搜索..." />
      <CommandList>
        <CommandEmpty>未找到结果。</CommandEmpty>
        <CommandGroup>
          {actions.map((action) => (
            <CommandItem
              key={action.name}
              className="gap-2"
              value={action.name}
              onSelect={action.action}
            >
              <HugeiconsIcon icon={action.icon}               
                size={18}
                strokeWidth={2}
                className="flex-shrink-0"
              />
              {action.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="会话">
          {sortSessions(sessions, "updatedAt")?.map((session) => {
            const assistantProps = getAssistantByKey(
              session.messages?.[0]?.inputProps?.assistant?.key!
            );
            return (
              <CommandItem
                key={session.id}
                value={`${session.id}/${session.title}`}
                className={cn(
                  "gap-2 w-full",
                  currentSession?.id === session.id
                    ? "bg-black/10 dark:bg-black/10"
                    : ""
                )}
                onSelect={(value) => {
                  router.push(`/chat/${session.id}`);
                  onClose();
                }}
              >
                {assistantProps?.model.icon("sm")}
                <span className="w-full truncate">{session.title}</span>
                <span className="pl-4 text-xs md:text-xs text-zinc-400 dark:text-zinc-700 flex-shrink-0">
                  {moment(session.createdAt).fromNow(true)}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};