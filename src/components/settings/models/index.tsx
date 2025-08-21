import { usePreferenceStore } from "@/hooks/use-preferences-store";
import { OpenAISettings } from "./openai";
import { AnthropicSettings } from "./anthropic";
import { GeminiSettings } from "./gemini";
import { OllamaSettings } from "./ollama";
import { Flex } from "@/components/ui/flex";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ModelIcon, ModelIconType } from "@/components/model-icon";
import { CheckmarkCircle02Icon, AlertCircleIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";

export const ModelSettings = () => {
  const { apiKeys } = usePreferenceStore();
  const modelSettingsData = [
    {
      label: "OpenAI",
      value: "openai",
      iconType: "openai",
      connected: !!apiKeys.openai,
      settingsComponent: OpenAISettings,
    },
    {
      label: "Anthropic",
      value: "anthropic",
      iconType: "anthropic",
      connected: !!apiKeys.anthropic,
      settingsComponent: AnthropicSettings,
    },
    {
      label: "Gemini",
      value: "gemini",
      iconType: "gemini",
      connected: !!apiKeys.gemini,
      settingsComponent: GeminiSettings,
    },
    {
      label: "Ollama",
      value: "ollama",
      iconType: "ollama",
      connected: !!apiKeys.ollama,
      settingsComponent: OllamaSettings,
    },
  ];

  return (
    <Flex direction={"col"} gap={"lg"} className="p-2">
      <Accordion type="single" collapsible className="w-full">
        {modelSettingsData.map((model) => (
          <AccordionItem key={model.value} value={model.value}>
            <AccordionTrigger>
              <Flex gap={"sm"} items="center">
                <ModelIcon type={model.iconType as ModelIconType} size="sm" />
                {model.label}
              </Flex>
              <Flex className="flex-1" />
              <div
                className={cn(
                  "px-2 !rotate-0",
                  model.connected ? "text-emerald-600" : "text-zinc-500"
                )}
              >
                {model.connected ? (
                  <HugeiconsIcon icon={CheckmarkCircle02Icon}
                    size={20}
                    strokeWidth={1.5}
                      
                  />
                ) : (
                  <HugeiconsIcon icon={AlertCircleIcon}   
                    size={20}
                    strokeWidth={1.5}
                    
                  />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <model.settingsComponent />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Flex>
  );
};
