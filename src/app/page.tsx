import React from "react";
import Faqs from "@/components/landing-page/faqs";
import Features from "@/components/landing-page/features";
import Footer from "@/components/landing-page/footer";
import Hero from "@/components/landing-page/hero";
import Navigtion from "@/components/landing-page/navigation";
import { createServer } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createServer();
  const { data } = await supabase.auth.getUser();
  console.log(data, "data");
  return (
    <main className="flex flex-col min-h-screen items-center justify-center">
      <Navigtion user={data?.user} />
      <Hero />
      <Features />
      <Faqs />
      <Footer />
    </main>
  );
}
