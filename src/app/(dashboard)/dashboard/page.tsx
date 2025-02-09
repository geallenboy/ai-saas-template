import { getUser } from "@/app/actions/auth-actions";
import Title from "@/components/dashboard/title";
import { createServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

const DashboardPage = async () => {
  const supabase = await createServer();
  const user = await getUser(supabase);
  if (!user) {
    return redirect("/login");
  }
  return (
    <section className="container mx-auto flex-1 space-y-6">
      <Title />
    </section>
  );
};

export default DashboardPage;
