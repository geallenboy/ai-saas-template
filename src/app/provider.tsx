"use client";
import * as React from "react";
import Header from "@/app/_components/Header";
import { useEffect} from "react";
import { useUser } from "@clerk/nextjs";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { addUser, getUserByEmail } from "@/servers/userServer";
import { useUserStore } from "@/stores/userStore";

const provider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const {setUser} = useUserStore((state:any)=>state)
  useEffect(() => {
    console.log(user,1199)
    user && saveNewUserIfNotExist();
  }, [user]);

  const saveNewUserIfNotExist = async () => {
    const userResp = await getUserByEmail(user?.primaryEmailAddress?.emailAddress??"")
    console.log(userResp,22)
    if (!userResp) {
      const result = await addUser(user)
      console.log("new User", result);
      setUser(result);
    } else {
      setUser(userResp);
    }
  };
  return (
    <PayPalScriptProvider
    options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "" }}
  >
     <Header />
     {children}
  </PayPalScriptProvider>
  );
};

export default provider;
