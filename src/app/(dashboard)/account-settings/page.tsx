import React from "react";
import Title from "@/components/account/title";
import { redirect } from "next/navigation";
import AccountForm from "@/components/account/account-form";
import SecuritySetting from "@/components/account/security-setting";
import { createServer } from "@/lib/supabase/server";
import { getUser } from "@/app/actions/auth-actions";

const AccountSettingsPage = async () => {
  const supabase = await createServer();
  const user = await getUser(supabase);
  if (!user) {
    return redirect("/login");
  }
  return (
    <div className="container mx-auto space-y-4">
      <Title />
      <div className="gird space-y-4">
        <AccountForm user={user} />
        <SecuritySetting user={user} />
      </div>
    </div>
  );
};

export default AccountSettingsPage;
