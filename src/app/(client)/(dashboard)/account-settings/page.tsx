"use client";
import React from "react";
import Title from "@/components/feature/users/components/title";

import AccountForm from "@/components/feature/users/components/account-form";
import SecuritySetting from "@/components/feature/users/components/security-setting";
import { useUserStore } from "@/store/userStore";

const AccountSettingsPage = () => {
  const { user } = useUserStore();
  return (
    <div className="container mx-auto space-y-4">
      <Title />
      <div className="gird space-y-4">
        {user && <AccountForm user={user} />}
        {user && <SecuritySetting user={user} />}
      </div>
    </div>
  );
};

export default AccountSettingsPage;
