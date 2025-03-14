"use client";

import React, { useCallback, useEffect, useState } from "react";

import { useUserStore } from "@/store/userStore";
import { getCurrentUser } from "@/services/clerk";

export default function Provider({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useUserStore();
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const data = await getCurrentUser();
    if (data?.name && data.id && data.clerkUserId && data.email && data.role) {
      setUser({
        name: data.name,
        id: data.id,
        clerkUserId: data.clerkUserId,
        email: data.email,
        role: data.role,
        imageUrl: data.imageUrl || null,
        deletedAt: data.deletedAt || null,
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
      });
    }
  };

  return <div>{children}</div>;
}
