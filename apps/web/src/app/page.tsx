"use client";
import { useQuery } from "convex/react";
import { api } from "@ribbit/backend/convex/_generated/api";
import Hero from "@/components/hero";
import Header from "@/components/header";
import { LightRays } from "@/components/ui/light-rays";
import Footer from "@/components/footer";

export default function Home() {
  const healthCheck = useQuery(api.healthCheck.get);

  return (
    <div className="w-full h-[100dvh] flex flex-col">
      <LightRays />
      <Header />
      <Hero />
      <Footer />
    </div>
  );
}
