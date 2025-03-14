"use client";
import React from "react";
import Faqs from "@/feature/landing-page/components/faqs";
import Features from "@/feature/landing-page/components/features";
import Footer from "@/feature/landing-page/components/footer";
import Hero from "@/feature/landing-page/components/hero";
import Navigtion from "@/feature/landing-page/components/navigation";
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
