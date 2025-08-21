import { motion } from "framer-motion";
import moment from "moment";
import { WavingHand02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const ChatGreeting = () => {
  const renderGreeting = (name: string) => {
    const date = moment();
    const hours = date.get("hour");
    if (hours < 12) return `早上好，`;
    if (hours < 18) return `下午好，`;
    return `晚上好，`;
  };

  return (
    <div className="flex flex-row items-start justify-start w-[720px] gap-2">
      <motion.h1
        className="text-3xl font-semibold py-2 text-left leading-9 tracking-tight text-zinc-800 dark:text-zinc-100"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: {
            duration: 1,
          },
        }}
      >
        <span className="text-zinc-300 dark:text-zinc-500 flex items-center flex-row gap-1">
          <HugeiconsIcon icon={WavingHand02Icon} size={32} strokeWidth={2} />
          你好，
        </span>
        今天我能为你做些什么？😊
      </motion.h1>
    </div>
  );
};
