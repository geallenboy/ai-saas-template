import { MainLayout } from "@/components/layout/main-layout";
import {
  AssistantsProvider,
  ChatProvider,
} from "@/context";
import { PromptsDialog } from "@/components/prompts-dialog";
import React from "react";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ChatProvider>
      <AssistantsProvider>
        <MainLayout>{children}</MainLayout>
        <PromptsDialog />
      </AssistantsProvider>
    </ChatProvider>
  );
}
