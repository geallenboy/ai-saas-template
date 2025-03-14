import React from "react";
import SignInForm from "@/components/custom/login/sigin-form";
import LoginImage from "@/components/custom/login/login-image";

const SignInPage = async () => {
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

export default SignInPage;
