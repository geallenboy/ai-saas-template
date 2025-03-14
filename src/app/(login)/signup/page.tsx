import LoginImage from "@/components/custom/login/login-image";
import SignUpForm from "@/components/custom/login/signup-form";
import { redirect } from "next/navigation";
import React from "react";

const SignupPage = async () => {
  return (
    <main className="h-screen grid grid-cols-1 md:grid-cols-2 relative">
      <LoginImage />
      <div className="relative flex flex-col items-center justify-center p-8 h-full w-full">
        <div className=" w-full md:w-[400px] mx-auto">
          <SignUpForm />
        </div>
      </div>
    </main>
  );
};

export default SignupPage;
