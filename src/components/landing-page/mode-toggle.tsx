"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";

export const ModeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mountedTheme, setMountedTheme] = useState<string | null>(null);
  const t = useTranslations("themeConfig");

  useEffect(() => {
    setMountedTheme(resolvedTheme || null);
  }, [resolvedTheme]);

  // 在 SSR 期间，先不渲染完整内容，防止 hydration 错误
  if (!mountedTheme) {
    return (
      <Button variant="outline" size="icon" className="w-[90px]">
        loading
      </Button>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="flex items-center gap-1 w-[90px]"
        >
          {/* 仅在 theme 存在时渲染图标，防止 hydration 问题 */}
          {resolvedTheme === "light" ? (
            <Sun className="h-4 w-4 transition-transform dark:-rotate-90 dark:scale-0" />
          ) : (
            <Moon className="h-4 w-4 transition-transform rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
          )}
          <span>{t(resolvedTheme || "light")}</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          {t("light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          {t("dark")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
