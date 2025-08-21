import { useEffect, useState } from "react";
import { Input } from "../../ui/input";
import { usePreferenceStore } from "@/hooks/use-preferences-store";
import { useToast } from "../../ui/use-toast";
import { useLLMTest } from "@/hooks/use-llm-test";
import { Button } from "../../ui/button";
import { Info } from "@phosphor-icons/react";
import { Flex } from "@/components/ui/flex";

export const OllamaSettings = () => {
  const [url, setURL] = useState<string>("");
  const { preferences, updatePreferences } = usePreferenceStore();
  const { toast } = useToast();
  useEffect(() => {
    setURL(preferences.ollamaBaseUrl);
  }, [preferences]);

  const handleURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setURL(e.target.value);
  };
  const verifyAndSaveURL = async () => {
    try {
      const response = await fetch(url + "/api/tags");
      if (response.status === 200) {
        console.log(response);
        toast({
          title: "成功",
          description: "Ollama 服务器端点有效",
        });
        updatePreferences({ ollamaBaseUrl: url });
      } else {
        throw new Error("Response status is not 200");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "错误",
        description: "无效的 Ollama 服务器端点",
        variant: "destructive",
      });
    }
  };
  return (
    <Flex direction={"col"} gap={"sm"}>
      <div className="flex flex-row items-end justify-between">
        <p className="text-xs md:text-sm text-zinc-500">
          Ollama 本地服务器 URL
        </p>
      </div>
      <Input
        placeholder="http://localhost:11434"
        value={url}
        autoComplete="off"
        onChange={handleURLChange}
      />

      <div className="flex flex-row items-center gap-2">
        <Button size="sm" onClick={verifyAndSaveURL}>
          保存 & 检查连接
        </Button>
      </div>
      {/* TODO: Add FAQ Section with q and a here you can use Type Component */}
    </Flex>
  );
};
