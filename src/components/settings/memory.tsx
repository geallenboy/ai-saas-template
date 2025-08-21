import { usePreferenceStore } from "@/hooks/use-preferences-store";
import { SettingCard } from "./setting-card";
import { SettingsContainer } from "./settings-container";

export const MemorySettings = () => {
  const { updatePreferences, preferences } = usePreferenceStore();

  const renderMemory = (memory: string) => {
    return (
      <SettingCard className="justify-center flex flex-col">
        {memory}
      </SettingCard>
    );
  };

  return (
    <SettingsContainer title="记忆">
      {preferences?.memories?.map(renderMemory)}
    </SettingsContainer>
  );
};
