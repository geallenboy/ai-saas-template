import { ArrowRight, Info } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useLLMTest } from "@/hooks/use-llm-test";
import { usePreferenceStore } from "@/hooks/use-preferences-store";
import { Flex } from "@/components/ui/flex";

export const OpenAISettings = () => {
  const [key, setKey] = useState<string>("");
  const { apiKeys, updateApiKey } = usePreferenceStore();
  const { renderSaveApiKeyButton } = useLLMTest();
  useEffect(() => {
    setKey(apiKeys.openai || "");
  }, [apiKeys.openai]);
  return (
    <Flex direction={"col"} gap="sm">
      <div className="flex flex-row items-end justify-between">
        <p className="text-xs md:text-sm  text-zinc-500">Open AI API Key</p>
      </div>
      <Input
        placeholder="Sk-xxxxxxxxxxxxxxxxxxxxxxxx"
        value={key}
        type="password"
        autoComplete="off"
        onChange={(e) => {
          setKey(e.target.value);
        }}
      />
      <div className="flex flex-row items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            window.open(
              "https://platform.openai.com/account/api-keys",
              "_blank"
            );
          }}
        >
          Get your API key here <ArrowRight size={16} weight="bold" />
        </Button>
        {key &&
          key !== apiKeys?.openai &&
          renderSaveApiKeyButton("openai", key, () => {
            updateApiKey("openai", key);
          })}
        {apiKeys?.openai && (
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => {
              setKey("");
              updateApiKey("openai", "");
            }}
          >
            Remove API Key
          </Button>
        )}
      </div>

      <div className="flex flex-row items-center gap-1 py-2 text-zinc-500">
        <Info size={16} weight="bold" />
        <p className="text-xs">
          API Key 存储在本地浏览器中，不会发送到其他地方。
        </p>
      </div>
    </Flex>
  );
};
