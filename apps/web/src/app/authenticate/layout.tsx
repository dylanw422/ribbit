"use client";

import { LightRays } from "@/components/ui/light-rays";

export default function AuthenticateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full h-screen justify-center">
      <LightRays />
      <div className="w-3/4 flex justify-center items-center z-10">{children}</div>{" "}
    </div>
  );
}
