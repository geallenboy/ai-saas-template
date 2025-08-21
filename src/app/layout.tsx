import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import {
  ReactQueryProvider,
  SessionsProvider,
} from "@/context";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { FiltersDialog } from "@/components/filters/filters-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";
import { interVar } from "./fonts";

export const metadata: Metadata = {
  title: "ai-chat",
  description: "最直观的一体化AI聊天客户端",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={cn(`${interVar.variable} font-sans`, "antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <TooltipProvider>
                <SessionsProvider>
                  {children}
                  <SettingsDialog />
                  <FiltersDialog />
                  <ConfirmDialog />
                </SessionsProvider>
            </TooltipProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
