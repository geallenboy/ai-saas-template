import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

import { ReactNode } from "react";

import { TApiKeys, TPreferences } from "./use-preferences-store";
import { usePreferenceStore } from "@/hooks/use-preferences-store";
import { googleSearchTool } from "@/tools/google";
import { duckduckGoTool } from "@/tools/duckduckgo";
import { dalleTool } from "@/tools/dalle";
import { useSettingsStore } from "@/stores/chat/settings";
import {
  GlobalSearchIcon,

  Image01Icon,
  BrainIcon,
} from "@hugeicons/core-free-icons";
import { TToolResponse } from ".";
import { memoryTool } from "@/tools/memory";

export const toolKeys = ["calculator", "web_search"];
export type TToolKey = (typeof toolKeys)[number];
export type IconSize = "sm" | "md" | "lg";

export type TToolArg = {
  updatePreferences: ReturnType<
    typeof usePreferenceStore
  >["updatePreferences"];
  preferences: TPreferences;
  apiKeys: TApiKeys;
  sendToolResponse: (response: TToolResponse) => void;
};

export type TTool = {
  key: TToolKey;
  description: string;
  renderUI?: (args: any) => ReactNode;
  name: string;
  loadingMessage?: string;
  resultMessage?: string;
  tool: (args: TToolArg) => any;
  icon: any;
  smallIcon: any;
  validate?: () => Promise<boolean>;
  validationFailedAction?: () => void;
  showInMenu?: boolean;
};

export const useTools = () => {
  const { preferences, updatePreferences, apiKeys } = usePreferenceStore();
  const { open } = useSettingsStore();
  const tools: TTool[] = [
    {
      key: "web_search",
      description: "网络搜索",
      tool:
        preferences?.defaultWebSearchEngine === "google"
          ? googleSearchTool
          : duckduckGoTool,
      name: "网络搜索",
      showInMenu: true,
      loadingMessage:
        preferences?.defaultWebSearchEngine === "google"
          ? "正在Google搜索..."
          : "正在DuckDuckGo搜索...",
      resultMessage:
        preferences?.defaultWebSearchEngine === "google"
          ? "Google搜索结果"
          : "DuckDuckGo搜索结果",
      icon: GlobalSearchIcon,
      smallIcon: GlobalSearchIcon,
      validate: async () => {
        if (
          preferences?.defaultWebSearchEngine === "google" &&
          (!preferences?.googleSearchApiKey ||
            !preferences?.googleSearchEngineId)
        ) {
          return false;
        }
        return true;
      },
      validationFailedAction: () => {
        open("web-search");
      },
    },
    {
      key: "image_generation",
      description: "生成图片",
      tool: dalleTool,
      showInMenu: true,
      name: "图片生成",
      loadingMessage: "正在生成图片",
      resultMessage: "图片已生成",
      icon: Image01Icon,
      smallIcon: Image01Icon,
      validationFailedAction: () => {
        open("web-search");
      },
      renderUI: ({ image }) => {
        return (
          <img
            src={image}
            alt=""
            className="w-[400px] h-[400px] rounded-2xl border"
          />
        );
      },
      validate: async () => {
        return true;
      },
    },
    {
      key: "memory",
      description: "AI会记住关于你的信息",
      tool: memoryTool,
      name: "记忆",
      showInMenu: true,
      validate: async () => {
        return true;
      },
      validationFailedAction: () => {
        open("web-search");
      },
      renderUI: ({ image }) => {
        return (
          <img
            src={image}
            alt=""
            className="w-[400px] h-[400px] rounded-2xl border"
          />
        );
      },
      loadingMessage: "正在保存到记忆中...",
      resultMessage: "记忆已更新",
      icon: BrainIcon,
      smallIcon: BrainIcon,
    },
  ];

  const searchTool = new TavilySearchResults({
    maxResults: 5,
    apiKey: "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",
  });

  const getToolByKey = (key: TToolKey) => {
    return tools.find((tool) => tool.key.includes(key));
  };

  const getToolInfoByKey = (key: TToolKey) => {
    return tools.find((tool) => tool.key.includes(key));
  };

  return {
    tools,
    getToolByKey,
    getToolInfoByKey,
  };
};
