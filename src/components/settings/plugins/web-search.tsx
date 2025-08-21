import { useToast } from "@/components/ui/use-toast";

import axios from "axios";
import { SettingsContainer } from "../settings-container";
import { ArrowRight, CaretDown, Info } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePreferenceStore } from "@/hooks/use-preferences-store";
import { useEffect, useState } from "react";
import { TPreferences } from "@/hooks/use-preferences-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingCard } from "../setting-card";
import { Flex } from "@/components/ui/flex";
import { Type } from "@/components/ui/text";

export const WebSearchPlugin = () => {
  const { toast } = useToast();
  const { preferences, updatePreferences } = usePreferenceStore();

  useEffect(() => {}, []);

  const renderWebSearchOptions = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={"sm"} variant={"secondary"}>
            google <CaretDown size={12} weight="bold" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]" align="end">
          <DropdownMenuItem>Google</DropdownMenuItem>
          <DropdownMenuItem>DuckDuckGo</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const handleRunTest = async () => {
    try {
      const url = "https://www.googleapis.com/customsearch/v1";
      const params = {
        key: preferences.googleSearchApiKey,
        cx: preferences.googleSearchEngineId,
        q: "Latest news",
      };

      const response = await axios.get(url, { params });

      if (response.status === 200) {
        toast({
          title: "Test Successful",
          description: "Google search plugin is working",
          variant: "default",
        });
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Google search plugin is not working",
        variant: "destructive",
      });
    }
  };

  return (
    <Flex
      direction={"col"}
      gap={"sm"}
      className="border-t pt-2 border-white/10"
    >
      <Flex className="w-full" justify={"between"} items="center">
        <Type size={"sm"} textColor={"secondary"}>
          Default Search Engine
        </Type>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={"sm"} variant={"secondary"}>
              {preferences.defaultWebSearchEngine}{" "}
              <CaretDown size={12} weight="bold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]" align="end">
            <DropdownMenuItem
              onClick={() => {
                updatePreferences({
                  defaultWebSearchEngine: "google",
                });
              }}
            >
              Google
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                updatePreferences({
                  defaultWebSearchEngine: "duckduckgo",
                });
              }}
            >
              DuckDuckGo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Flex>
      {preferences.defaultWebSearchEngine === "google" && (
        <SettingCard className="flex flex-col w-full items-start gap-2 py-3">
          <Flex direction={"col"} gap="sm" className="w-full">
            <Type
              size={"xs"}
              className="flex flex-row gap-2 items-center"
              textColor={"secondary"}
            >
              Google Search Engine ID <Info weight="regular" size={14} />
            </Type>
            <Input
              name="googleSearchEngineId"
              type="text"
              value={preferences.googleSearchEngineId}
              autoCapitalize="off"
              onChange={(e) => {
                updatePreferences({
                  googleSearchEngineId: e.target.value,
                });
              }}
            />
          </Flex>
          <Flex direction={"col"} gap={"sm"} className="w-full">
            <Type
              size={"xs"}
              className="flex flex-row gap-2 items-center"
              textColor={"secondary"}
            >
              Google Search Api Key <Info weight="regular" size={14} />
            </Type>
            <Input
              name="googleSearchApiKey"
              type="text"
              value={preferences.googleSearchApiKey}
              autoCapitalize="off"
              onChange={(e) => {
                updatePreferences({
                  googleSearchApiKey: e.target.value,
                });
              }}
            />
          </Flex>
          <Flex gap="sm">
            <Button onClick={handleRunTest} size={"sm"}>
              Run check
            </Button>
            <Button
              size={"sm"}
              variant={"secondary"}
              onClick={() => {
                window.open(
                  "https://programmablesearchengine.google.com/controlpanel/create",
                  "_blank"
                );
              }}
            >
              Get your API key here <ArrowRight size={16} weight="bold" />
            </Button>
          </Flex>
        </SettingCard>
      )}
    </Flex>
  );
};
