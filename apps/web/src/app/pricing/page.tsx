"use client";
import Header from "@/components/header";
import Pricing from "@/components/pricing";
import { LightRays } from "@/components/ui/light-rays";
import { api } from "@ribbit/backend/convex/_generated/api";
import { useQuery } from "convex/react";

export default function PricingPage() {
  const user = useQuery(api.polar.getCurrentUser);
  return (
    <div className="w-full h-[100dvh] flex flex-col items-center">
      <Header />
      <div className="w-2/3 z-10">
        <h1 className="text-4xl font-mono font-bold py-12 text-center">Upgrade Your Argument.</h1>
        <Pricing user={user} />
      </div>
    </div>
  );
}
