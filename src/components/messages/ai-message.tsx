
import { useRef, useState } from "react";
import * as Selection from "selection-popover";

import {
  useChatContext,
  useSessionsContext,
} from "@/context";
import { useSettingsStore } from "@/stores/chat/settings";
import { TChatMessage } from "@/hooks/use-chat-session";

import {
  TToolResponse,
  useClipboard,
  useMarkdown,
  useModelList,
  useTextSelection,
  useTools,
} from "@/hooks";
import { RegenerateWithModelSelect } from "../regenerate-model-select";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Flex } from "../ui/flex";
import Spinner from "../ui/loading-spinner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Type } from "../ui/text";
import { Tooltip } from "../ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Delete01Icon,
  ThumbsDownIcon,
  Tick01Icon,
  Queue02Icon,
} from "@hugeicons/core-free-icons";
export type TAIMessage = {
  chatMessage: TChatMessage;
  isLast: boolean;
};

export const AIMessage = ({ chatMessage, isLast }: TAIMessage) => {
  const { id, rawAI, isLoading, stop, stopReason, tools, inputProps } =
    chatMessage;

  const { getToolInfoByKey } = useTools();
  const messageRef = useRef<HTMLDivElement>(null);
  const { showCopied, copy } = useClipboard();
  const { getModelByKey, getAssistantByKey, getAssistantIcon } = useModelList();
  const { renderMarkdown } = useMarkdown();
  const { open: openSettings } = useSettingsStore();
  const { removeMessage } = useSessionsContext();
  const { handleRunModel, setContextValue, editor } = useChatContext();
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const { selectedText } = useTextSelection();

  const isToolRunning = !!tools?.filter((t) => !!t?.toolLoading)?.length;

  const renderTool = (tool: TToolResponse) => {
    const toolUsed = tool?.toolName
      ? getToolInfoByKey(tool?.toolName)
      : undefined;

    if (!toolUsed) {
      return null;
    }

    const Icon = toolUsed.smallIcon;

    return (
      <>
        {toolUsed && (
          <Type
            size={"xs"}
            className="flex flex-row gap-2 items-center"
            textColor={"tertiary"}
          >
            {tool?.toolLoading ? (
              <Spinner />
            ) : (
              <HugeiconsIcon icon={Icon} size={20} strokeWidth={1.5} />
            )}
            <Type size={"sm"} textColor={"tertiary"}>
              {tool?.toolLoading
                ? toolUsed.loadingMessage
                : toolUsed.resultMessage}
            </Type>
          </Type>
        )}
        {toolUsed &&
          tool?.toolRenderArgs &&
          toolUsed?.renderUI?.(tool?.toolRenderArgs)}
      </>
    );
  };

  const modelForMessage = getModelByKey(inputProps!.assistant.baseModel);

  const handleCopyContent = () => {
    if (messageRef.current && rawAI) {
      copy(rawAI);
    }
  };

  const renderStopReason = () => {
    switch (stopReason) {
      case "error":
        return (
          <Alert variant="destructive">
            <AlertDescription>
              出现了问题。请确保您的API正常工作{" "}
              <Button variant="link" size="link" onClick={() => openSettings()}>
                检查API密钥
              </Button>
            </AlertDescription>
          </Alert>
        );
      case "cancel":
        return (
          <Type size="sm" textColor="tertiary" className="italic">
            聊天会话已结束
          </Type>
        );
      case "apikey":
        return (
          <Alert variant="destructive">
            <AlertDescription>
              无效的API密钥{" "}
              <Button variant="link" size="link" onClick={() => openSettings()}>
                检查API密钥
              </Button>
            </AlertDescription>
          </Alert>
        );
      case "recursion":
        return (
          <Alert variant="destructive">
            <AlertDescription>检测到递归</AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-row mt-6 w-full">
      <div className="p-2 md:px-3 md:py-2">
        <Tooltip content={inputProps?.assistant.name}>
          {getAssistantIcon(inputProps!.assistant.key)}
        </Tooltip>
      </div>
      <Flex
        ref={messageRef}
        direction="col"
        gap="md"
        items="start"
        className="w-full p-2 flex-1 overflow-hidden"
      >
        {tools?.map(renderTool)}

        {rawAI && (
          <Selection.Root>
            <Selection.Trigger asChild>
              <article className="prose dark:prose-invert w-full prose-zinc prose-h3:font-medium prose-h4:font-medium prose-h5:font-medium prose-h6:font-medium prose-h3:text-lg prose-h4:text-base prose-h5:text-base prose-h6:text-base prose-heading:font-medium prose-strong:font-medium prose-headings:text-lg prose-th:text-sm">
                {renderMarkdown(rawAI, !!isLoading, id)}
              </article>
            </Selection.Trigger>
            <Selection.Portal
              container={document?.getElementById("chat-container")}
            >
              <Selection.Content sticky="always" sideOffset={10}>
                {selectedText && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setContextValue(selectedText);
                      editor?.commands.clearContent();
                      editor?.commands.focus("end");
                    }}
                  >
                      <HugeiconsIcon icon={Queue02Icon} size={16} /> 回复
                  </Button>
                )}
              </Selection.Content>
            </Selection.Portal>
          </Selection.Root>
        )}
        {stop && stopReason && renderStopReason()}

        <Flex
          justify="between"
          items="center"
          className="w-full pt-1 opacity-100 transition-opacity"
        >
          {isLoading && (
            <Flex gap="sm">
              <Spinner />
              <Type size="sm" textColor="tertiary">
                {!!rawAI?.length ? "正在输入..." : "正在思考..."}
              </Type>
            </Flex>
          )}
          {!isLoading && !isToolRunning && (
            <div className="flex flex-row gap-1">
              <Tooltip content="复制">
                <Button
                  variant="ghost"
                  size="iconSm"
                  rounded="lg"
                  onClick={handleCopyContent}
                >
                  {showCopied ? (
                    <HugeiconsIcon icon={Tick01Icon} size={18} strokeWidth={2} /> 
                  ) : (
                    <HugeiconsIcon icon={Copy01Icon} size={18}  strokeWidth={2} />
                  )}
                </Button>
              </Tooltip>

              <Tooltip content="复制">
                <Button
                  variant={"ghost"}
                  size={"iconSm"}
                  rounded={"lg"}
                  onClick={handleCopyContent}
                >
                  <HugeiconsIcon icon={ThumbsDownIcon}
                    size={18}
                    strokeWidth={2}
                  />
                </Button>
              </Tooltip>
              <Tooltip content="删除">
                <Popover
                  open={openDeleteConfirm}
                  onOpenChange={setOpenDeleteConfirm}
                >
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="iconSm" rounded="lg">
                        <HugeiconsIcon icon={Delete01Icon}
                        size={18}
                        strokeWidth={2}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <p className="text-sm md:text-base font-medium pb-2">
                      确定要删除这条消息吗？
                    </p>
                    <div className="flex flex-row gap-1">
                      <Button
                        variant="destructive"
                        onClick={() => removeMessage(id)}
                      >
                        删除消息
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setOpenDeleteConfirm(false)}
                      >
                        取消
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </Tooltip>
            </div>
          )}
          {chatMessage && isLast && (
            <RegenerateWithModelSelect
              assistant={inputProps!.assistant}
              onRegenerate={(assistant: string) => {
                const props = getAssistantByKey(assistant);
                if (!props?.assistant) {
                  return;
                }
                handleRunModel({
                  input: chatMessage.rawHuman,
                  messageId: chatMessage.id,
                  assistant: props.assistant,
                  sessionId: chatMessage.sessionId,
                });
              }}
            />
          )}
          {/* {!isLoading && !isToolRunning && (
            <div className="flex flex-row gap-2 items-center text-xs text-zinc-500">
              {modelForMessage?.name}
            </div>
          )} */}
        </Flex>
      </Flex>
    </div>
  );
};
