"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <div className="flex w-full h-screen relative">
        <SidebarTrigger className="hover:cursor-pointer fixed" />
        <div className="w-full flex h-full justify-center">
          {/* CHILDREN / MESSAGES */}
          <div className="md:w-5/6 w-full h-full px-8">{children}</div>
        </div>
      </div>
    </>
  );
}
