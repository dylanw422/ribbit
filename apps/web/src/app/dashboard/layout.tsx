"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { Particles } from "@/components/ui/particles";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <div className="flex w-full h-screen relative">
        <SidebarTrigger className="hover:cursor-pointer fixed" />
        <div className="w-full flex h-full justify-center overflow-y-scroll">
          {/* CHILDREN / MESSAGES */}
          <Particles className="fixed w-full h-full" color="#6e6e6e" />
          <div className="md:w-5/6 w-full h-full px-8 z-10">{children}</div>
        </div>
      </div>
    </>
  );
}
