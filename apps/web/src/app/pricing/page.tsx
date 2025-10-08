"use client";
import Header from "@/components/header";
import Pricing from "@/components/pricing";

export default function PricingPage() {
  return (
    <div className="w-full h-[100dvh] flex flex-col items-center">
      <Header />
      <div className="w-2/3">
        <h1 className="text-4xl font-mono font-bold py-12 text-center">Upgrade Your Argument.</h1>
        <Pricing />
      </div>
    </div>
  );
}
