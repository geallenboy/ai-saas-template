import React from "react";
import SignInForm from "@/components/login/sigin-form";
import LoginImage from "@/components/login/login-image";
import { createServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUser } from "@/app/actions/auth-actions";

const LoginPage = async () => {
  const supabase = await createServer();
  const user = await getUser(supabase);

  if (user) {
    return redirect("/dashboard");
  }
  return (
    <main className="h-screen grid grid-cols-1 md:grid-cols-2 relative">
      <LoginImage />
      <div className="relative flex flex-col items-center justify-center p-8 h-full w-full">
        <div className=" w-full md:w-[400px] mx-auto">
          <SignInForm />
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
