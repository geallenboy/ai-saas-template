"use client";
import * as React from "react";
import { NextUIProvider } from "@nextui-org/react";
import Header from "@/app/_components/Header";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";
import { Users } from "@/config/schema";
import { UserDetailContext } from "@/_context/UserDetailConext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const provider = ({ children }: { children: React.ReactNode }) => {
  const [userDetail, setUserDetail] = useState<any>();
  const { user } = useUser();
  useEffect(() => {
    user && saveNewUserIfNotExist();
  }, [user]);

  const saveNewUserIfNotExist = async () => {
    const userResp = await db
      .select()
      .from(Users)
      .where(
        eq(Users.userEmail, user?.primaryEmailAddress?.emailAddress ?? "")
      );

    if (!userResp[0]) {
      const result = await db
        .insert(Users)
        .values({
          userEmail: user?.primaryEmailAddress?.emailAddress,
          userImage: user?.imageUrl,
          userName: user?.fullName,
        })
        .returning({
          userEmail: Users.userEmail,
          userName: Users.userName,
          userImage: Users.userImage,
          credit: Users.credit,
        });
      console.log("new User", result[0]);
      setUserDetail(result[0]);
    } else {
      setUserDetail(userResp[0]);
    }
  };
  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <PayPalScriptProvider
        options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "" }}
      >
        <NextUIProvider>
          <Header />
          {children}
        </NextUIProvider>
      </PayPalScriptProvider>
    </UserDetailContext.Provider>
  );
};

export default provider;
