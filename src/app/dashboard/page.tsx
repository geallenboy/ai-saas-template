"use client";
import { useUserStore } from "@/stores/userStore";
import React from "react";

function Dashboard() {
  const users = useUserStore((state:any)=>state.users)
  console.log(users,99)
  return <div className="p-10 md:px-20 lg:px-40 min-h-screen">dashboard</div>;
}

export default Dashboard;
