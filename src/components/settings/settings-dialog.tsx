"use client";
import { CommonSettings } from "@/components/settings/common";
import { Data } from "@/components/settings/data";
import { MemorySettings } from "@/components/settings/memory";
import { ModelSettings } from "@/components/settings/models";
import { PluginSettings } from "@/components/settings/plugins";
import { VoiceInput } from "@/components/settings/voice-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  BrainIcon,
  DashboardCircleIcon,
  Database02Icon,
  Settings03Icon,
  SparklesIcon,
  VoiceIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSettingsStore } from "@/stores/chat/settings";

export type TSettingMenuItem = {
  name: string;
  key: string;
  icon: () => React.ReactNode;
  component: React.ReactNode;
};

export const SettingsDialog = () => {
  const { isSettingOpen, selectedMenu, dismiss, setSelectedMenu } = useSettingsStore();

  const settingMenu: TSettingMenuItem[] = [
    {
      name: "通用",
      icon: () => <HugeiconsIcon icon={Settings03Icon} size={18} strokeWidth={2} />,
      key: "common",
      component: <CommonSettings />,
    },
    {
      name: "模型",
      icon: () => <HugeiconsIcon icon={SparklesIcon} size={18} strokeWidth={2} />,
      key: "models",
      component: <ModelSettings />,
    },
    {
      name: "插件",
      icon: () => <HugeiconsIcon icon={DashboardCircleIcon} size={18} strokeWidth={2} />,
      key: "plugins",
      component: <PluginSettings />,
    },
    {
      name: "记忆",
      icon: () => <HugeiconsIcon icon={BrainIcon} size={18} strokeWidth={2} />,
      key: "memory",
      component: <MemorySettings />,
    },
    {
      name: "语音输入",
      icon: () => <HugeiconsIcon icon={VoiceIcon} size={18} strokeWidth={2} />,
      key: "voice-input",
      component: <VoiceInput />,
    },
    {
      name: "数据",
      icon: () => <HugeiconsIcon icon={Database02Icon} size={18} strokeWidth={2} />,
      key: "Your Data",
      component: <Data />,
    },
  ];

  const selectedMenuItem = settingMenu.find(
    (menu) => menu.key === selectedMenu
  );

  return (
    <Dialog open={isSettingOpen} onOpenChange={dismiss}>
      <DialogContent className="w-[96dvw] max-h-[80dvh] rounded-2xl md:min-w-[800px] gap-0 md:h-[600px] flex flex-col overflow-hidden border border-white/5 p-0">
        <div className="w-full px-4 py-3 border-b border-zinc-500/20">
          <p className="text-md font-medium">设置</p>
        </div>
        <div className="flex flex-col md:flex-row w-full relative h-full overflow-hidden">
          <div className="w-full md:w-[220px] px-2  pt-2 pb-2 md:pb-16 border-zinc-500/10 absolute md:h-full overflow-x-auto md:overflow-y-auto no-scrollbar left-0 top-0 right-0 md:bottom-0 flex flex-row md:flex-col md:gap-0 gap-1">
            {settingMenu.map((menu) => (
              <Button
                variant={selectedMenu === menu.key ? "secondary" : "ghost"}
                key={menu.key}
                onClick={() => setSelectedMenu(menu.key)}
                className="justify-start gap-2 px-2"
                size="default"
              >
                <div className="w-6 h-6 flex flex-row items-center justify-center">
                  {menu.icon()}
                </div>
                <span
                  className={cn(
                    "text-xs md:text-sm md:flex font-medium",
                    selectedMenu === menu.key ? "flex" : "hidden"
                  )}
                >
                  {menu.name}
                </span>
              </Button>
            ))}
          </div>
          <div className="md:ml-[220px] mt-12 md:mt-0 pb-16 w-full h-full overflow-y-auto no-scrollbar">
            {selectedMenuItem?.component}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};