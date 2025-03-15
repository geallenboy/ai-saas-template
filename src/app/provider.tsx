"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { getCurrentUser } from "@/lib/clerk";

export default function Provider({ children }: { children: React.ReactNode }) {
  const { setUser } = useUserStore();

  const init = useCallback(async () => {
    const data = await getCurrentUser();
    if (data) {
      setUser({
        name: data?.name,
        id: data.id,
        clerkUserId: data.clerkUserId,
        email: data.email,
        role: data.role,
        imageUrl: data.imageUrl || null,
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
        credits: data?.credits,
      });
    }
  }, [setUser]);

  useEffect(() => {
    init();
  }, [init]);

  return <div>{children}</div>;
}
