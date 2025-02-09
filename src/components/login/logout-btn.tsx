"use client";

import { logoutAction } from "@/app/actions/auth-actions";
import { useTranslations } from "next-intl";
import React from "react";

export const LogoutBtn = () => {
  const sidebarT = useTranslations("sidebar");
  const handleLogout = async () => {
    await logoutAction();
  };
  return (
    <span
      onClick={handleLogout}
      className="inline-block w-full cursor-pointer text-destructive"
    >
      {sidebarT("logout")}
    </span>
  );
};

export default LogoutBtn;
