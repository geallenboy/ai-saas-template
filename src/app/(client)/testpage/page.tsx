"use client";
import React from "react";
import { useUserStore } from "@/store/userStore";
const TestPage = () => {
  const { user } = useUserStore();
  console.log(user);
  return <div>TestPage</div>;
};

export default TestPage;
