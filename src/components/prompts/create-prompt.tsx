"use client";
import { TPrompt } from "@/hooks/use-prompts-store";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Highlight } from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
export type TCreatePrompt = {
  prompt?: TPrompt;
  onCreatePrompt: (prompt: Omit<TPrompt, "id">) => Promise<void>;
  onUpdatePrompt: (prompt: Partial<Omit<TPrompt, "id">>) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
export const CreatePrompt = ({
  open,
  onOpenChange,
  prompt,
  onCreatePrompt,
  onUpdatePrompt,
}: TCreatePrompt) => {
  const [promptTitle, setPromptTitle] = useState(prompt?.name);
  const promptTitleRef = useRef<HTMLInputElement | null>(null);
  const [rawPrompt, setRawPrompt] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Enter prompt here...",
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: "prompt-highlight",
        },
      }),
    ],
    content: prompt?.content || "",
    autofocus: true,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    onTransaction(props) {
      //   const { editor } = props;
      //   const text = editor.getText();
      //   const html = editor.getHTML();
      //   const newHTML = html.replace(
      //     /{{{{(.*?)}}}}/g,
      //     ` <mark class="prompt-highlight">$1</mark> `
      //   );
      //   if (newHTML !== html) {
      //     editor.commands.setContent(newHTML, {
      //       parseOptions: {
      //         preserveWhitespace: true,
      //       },
      //     });
      //   }
    },
    parseOptions: {
      preserveWhitespace: true,
    },
  });
  useEffect(() => {
    promptTitleRef?.current?.focus();
  }, [open]);
  const clearPrompt = () => {
    setPromptTitle("");
    editor?.commands.setContent("");
  };
  const savePrompt = async () => {
    const content = editor?.getText();
    if (!content) {
      return;
    }
    if (!promptTitle) {
      return;
    }

    try {
      if (prompt) {
        await onUpdatePrompt({ name: promptTitle, content });
      } else {
        await onCreatePrompt({ name: promptTitle, content });
      }

      clearPrompt();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save prompt:', error);
    }
  };
  return (
    <div className="flex flex-col items-start  w-full h-full relative overflow-hidden">
      <div className="w-full px-2 py-2 border-b border-zinc-500/20 flex flex-row gap-3 items-center">
        <Button
          size="iconSm"
          variant="ghost"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        </Button>
        <p className="text-base font-medium">
          {prompt ? "编辑提示词" : "创建新提示词"}
        </p>
      </div>
      <div className="flex flex-col w-full flex-1 p-2 overflow-y-auto h-full pb-[80px] no-scrollbar">
        <Input
          type="text"
          placeholder="提示词名称"
          variant="ghost"
          value={promptTitle}
          ref={promptTitleRef}
          onChange={(e) => setPromptTitle(e.target.value)}
          className="w-full bg-transparent"
        />
        <EditorContent
          editor={editor}
          autoFocus
          className="w-full p-3 [&>*]:leading-7 text-sm md:text-base outline-none focus:outline-none  [&>*]:outline-none no-scrollbar [&>*]:no-scrollbar cursor-text"
        />
        <p className="text-xs text-zinc-500 py-2 px-3 flex flex-row gap-2 items-center">
          使用 <Badge>{`{{{{ input }}}}`}</Badge> 表示用户输入
        </p>
      </div>
      <div className="w-full px-2 py-2 border-t bg-white dark:bg-zinc-800 absolute bottom-0 left-0 right-0 border-zinc-500/20 flex flex-row gap-3 items-center">
        <Button
          variant="default"
          onClick={() => {
            savePrompt();
          }}
        >
          保存
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          取消
        </Button>
      </div>
    </div>
  );
};
