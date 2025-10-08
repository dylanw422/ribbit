"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { Particles } from "@/components/ui/particles";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useRef } from "react";
import { ScrollProvider, useScroll } from "@/components/scroll-provider";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setHasScroll, setScrollHeight } = useScroll();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      setHasScroll(el.scrollHeight > el.clientHeight);
      setScrollHeight(el.scrollHeight);
    };

    // Initial check
    checkScroll();

    // Use ResizeObserver to detect content changes
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);

    // Also listen to window resize
    window.addEventListener("resize", checkScroll);

    // Use MutationObserver to detect DOM changes
    const mutationObserver = new MutationObserver(checkScroll);
    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", checkScroll);
    };
  }, [setHasScroll, setScrollHeight]);

  return (
    <>
      <AppSidebar />
      <div className="flex w-full h-screen relative overflow-hidden">
        <SidebarTrigger className="hover:cursor-pointer fixed" />
        <div
          id="scroll-container"
          ref={scrollRef}
          className="w-full flex justify-center overflow-y-auto overscroll-none"
        >
          <Particles className="fixed w-full h-full" color="#6e6e6e" />
          <div className="md:w-5/6 w-full px-8 z-10">{children}</div>
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ScrollProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ScrollProvider>
  );
}
