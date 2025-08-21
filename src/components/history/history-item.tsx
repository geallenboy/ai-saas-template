import { useSessionsContext } from "@/context/sessions";
import { TChatSession } from "@/hooks/use-chat-session";
import { useModelList } from "@/hooks/use-model-list";
import { cn } from "@/lib/utils";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Flex } from "../ui/flex";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Type } from "../ui/text";
import { Tooltip } from "../ui/tooltip";
import { Delete01Icon, Edit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const HistoryItem = ({
  session,
  dismiss,
}: {
  session: TChatSession;
  dismiss: () => void;
}) => {
  const {
    currentSession,
    updateSessionMutation,
    removeSessionByIdMutation,
    createSession,
  } = useSessionsContext();
  const { getModelByKey, getAssistantByKey } = useModelList();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(session.title);
  const router = useRouter();
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const historyInputRef = useRef<HTMLInputElement>(null);

  const assistantProps = getAssistantByKey(
    session.messages?.[0]?.inputProps?.assistant?.key!
  );

  const modelProps = getModelByKey(
    session.messages?.[0]?.inputProps?.assistant?.baseModel!
  );

  useEffect(() => {
    if (isEditing) {
      historyInputRef.current?.focus();
    }
  }, [isEditing]);

  return (
    <div
      key={session.id}
      className={cn(
        "gap-2 group w-full cursor-pointer flex flex-row items-start p-2 rounded-xl hover:bg-black/10 hover:dark:bg-black/30",
        currentSession?.id === session.id || isEditing
          ? "bg-black/10 dark:bg-black/30"
          : ""
      )}
      onClick={() => {
        if (!isEditing) {
          router.push(`/chat/${session.id}`);
          dismiss();
        }
      }}
    >
      {isEditing ? (
        <Input
          variant="ghost"
          className="h-6 text-sm"
          ref={historyInputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsEditing(false);
              updateSessionMutation.mutate({
                sessionId: session.id,
                session: {
                  title: title?.trim() || session?.title || "Untitled",
                },
              });
            }
          }}
          onBlur={() => {
            setIsEditing(false);
            updateSessionMutation.mutate({
              sessionId: session.id,
              session: { title: title?.trim() || session?.title || "Untitled" },
            });
          }}
        />
      ) : (
        <>
          {modelProps?.icon?.("sm")}
          <Flex direction="col" items="start" className="w-full">
            <Type
              className="line-clamp-1"
              size="sm"
              textColor="primary"
              weight="medium"
            >
              {session.title}
            </Type>
            <Type className="line-clamp-1" size="xs" textColor="tertiary">
              {moment(session.updatedAt).fromNow()}
            </Type>
          </Flex>
        </>
      )}
      {(!isEditing || openDeleteConfirm) && (
        <Flex
          className={cn("group-hover:flex hidden", openDeleteConfirm && "flex")}
        >
          <Button
            variant="ghost"
            size="iconXS"
            onClick={(e) => {
              setIsEditing(true);
              e.stopPropagation();
            }}
          >
            <HugeiconsIcon icon={Edit02Icon} size={14} strokeWidth={2} />
          </Button>
          <Tooltip content="删除">
            <Popover
              open={openDeleteConfirm}
              onOpenChange={setOpenDeleteConfirm}
            >
              <PopoverTrigger asChild>
                <Button
                  variant={openDeleteConfirm ? "secondary" : "ghost"}
                  size="iconXS"
                  onClick={(e) => {
                    // setOpenDeleteConfirm(true);
                    // e.stopPropagation();
                    removeSessionByIdMutation.mutate(session.id, {
                      onSuccess: () => {
                        createSession({
                          redirect: true,
                        });
                      },
                    });
                    e.stopPropagation();
                  }}
                >
                  <HugeiconsIcon icon={Delete01Icon} size={14} strokeWidth={2} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="z-[1000]" side="bottom">
                <p className="text-sm md:text-base font-medium pb-2">
                  确定要删除这条消息吗？
                </p>
                <div className="flex flex-row gap-1">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      removeSessionByIdMutation.mutate(session.id, {
                        onSuccess: () => {
                          createSession({
                            redirect: true,
                          });
                        },
                      });
                      e.stopPropagation();
                    }}
                  >
                    删除消息
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      setOpenDeleteConfirm(false);
                      e.stopPropagation();
                    }}
                  >
                    取消
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </Tooltip>
        </Flex>
      )}
    </div>
  );
};
