import { useChatContext } from "@/context/chat";
import { usePromptsStoreHook } from "@/hooks/use-prompts-store";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import { Flex } from "./ui/flex";
import { Type } from "./ui/text";
import { HugeiconsIcon } from "@hugeicons/react";

export type TChatExamples = {};
export const ChatExamples = () => {
  const { allPrompts } = usePromptsStoreHook();
  const { editor } = useChatContext();
  if (!allPrompts?.length) {
    return null;
  }
  return (
    <Flex direction="col" gap="md" justify="center" items="center">
      <div className="flex flex-col gap-3 p-4">
        <Type size="sm" textColor="tertiary">
          试试这些提示词
        </Type>
        <div className="flex flex-col gap-1 md:gap-3 md:w-[700px] lg:w-[720px] w-full">
          {allPrompts.slice(0, 3)?.map((example, index) => (
            <motion.div
              initial={{
                opacity: 0,
              }}
              className="flex bg-white dark:bg-zinc-800 flex-row gap-2 items-center text-sm md:text-base dark:border-white/5 text-zinc-600 dark:text-zinc-400 w-full  cursor-pointer relative"
              key={index}
              animate={{
                opacity: 1,
              }}
              onClick={() => {
                editor?.commands?.clearContent();
                editor?.commands?.setContent(example.content);
                editor?.commands?.focus("end");
              }}
            >
              <HugeiconsIcon icon={ArrowRight02Icon} size={18} strokeWidth={2} />
              <p className="text-sm md:text-base hover:underline hover:decoration-zinc-500 hover:underline-offset-4 text-zinc-800 dark:text-white font-medium w-full">
                {example.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Flex>
  );
};
