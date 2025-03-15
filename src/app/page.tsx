"use client";
import React from "react";
import Faqs from "@/components/feature/landing-page/faqs";
import Features from "@/components/feature/landing-page/features";
import Footer from "@/components/feature/landing-page/footer";
import Hero from "@/components/feature/landing-page/hero";
import Navigtion from "@/components/feature/landing-page/navigation";
import { useUserStore } from "@/store/userStore";

export default function HomePage() {
  const { user } = useUserStore();
  return (
    <main className="flex flex-col min-h-screen items-center justify-center">
      <Navigtion user={user} />
      <Hero />
      <Features />
      <Faqs />
      <Footer />
    </main>
  );
}
