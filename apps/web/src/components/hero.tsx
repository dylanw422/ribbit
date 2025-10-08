import React from "react";
import { InteractiveGridPattern } from "./ui/interactive-grid-pattern";
import { LightRays } from "./ui/light-rays";
import { Button } from "./ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="w-full px-8 flex flex-col gap-4 justify-center items-center relative my-auto">
      <h1 className="text-center text-4xl md:text-6xl font-bold font-mono">
        BIAS ISN'T A BUG <br /> IT'S A FEATURE
      </h1>
      <h1 className="text-white/50 text-center">WHERE YOUR PERSPECTIVE DRIVES THE CONVERSATION</h1>
      <Link href="/pricing">
        <Button className="bg-black border text-white my-12 hover:bg-neutral-300/5">
          Compare Plans
        </Button>
      </Link>
    </div>
  );
}
