"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  AiFillMessage,
  AiOutlineFire,
  AiOutlineLogout,
  AiOutlineMore,
  AiOutlineReload,
  AiOutlineRollback,
  AiOutlineSearch,
} from "react-icons/ai";
import Link from "next/link";
import SidebarDivider from "./ui/sidebar-divider";
import { api } from "@ribbit/backend/convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CustomerPortalLink } from "@convex-dev/polar/react";

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const threadFromPath = pathname.split("/").pop();
  const user = useQuery(api.auth.getCurrentUser);
  const userId = user?._id;
  const customerPortal = useAction(api.payments.getCustomerPortal);

  const threads = useQuery(api.agentInteractions.allThreads, {
    userId: userId ?? "",
  });

  const heatedThreads = useQuery(api.heated.allHeated);

  const isHeated = (threadId: string) => {
    if (!heatedThreads) return false;
    return heatedThreads.some((heated) => heated.threadId === threadId);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const createCustomerPortal = async () => {
    const result = await customerPortal({
      send_email: false,
    });
    window.location.href = result.portal_url;
  };

  return (
    <Sidebar>
      <SidebarContent className="bg-black flex">
        <SidebarHeader className="hover:cursor-pointer" onClick={() => router.push("/")}>
          <h1 className="font-mono font-bold tracking-widest">RIBBIT.</h1>
        </SidebarHeader>
        <SidebarGroup className="text-sm space-y-4 pl-3">
          <Link href="/dashboard">
            <SidebarMenuItem>
              <AiFillMessage className="size-4" />
              New Chat
            </SidebarMenuItem>
          </Link>
          <SidebarMenuItem className="">
            <AiOutlineSearch className="size-4" />
            Search Chats
          </SidebarMenuItem>
        </SidebarGroup>
        <SidebarDivider />
        <h1 className="text-xs font-bold text-neutral-500 pl-3 font-mono tracking-widest">
          CONVERSATIONS
        </h1>{" "}
        <SidebarGroup
          className="
          flex-1
    text-sm space-y-4 pl-3 overflow-y-auto
    scrollbar-track-transparent
    [&::-webkit-scrollbar]:w-0
    hover:[&::-webkit-scrollbar]:w-2
  "
        >
          {(threads?.threads?.page ?? [])
            .sort((a, b) => b._creationTime - a._creationTime)
            .map((thread) => (
              <Link key={thread._id} href={`/dashboard/${thread._id}`}>
                <SidebarMenuItem
                  className={`
    ${thread._id === threadFromPath ? "font-semibold underline animate transition-all" : ""}
    ${isHeated(thread._id) ? "decoration-orange-600" : ""}
  `}
                >
                  <span
                    className={`block truncate ${isHeated(thread._id) ? "text-orange-600" : ""}`}
                  >
                    {isHeated(thread._id) && (
                      <AiOutlineFire className="inline-block w-4 h-4 ml-1 align-text-top" />
                    )}{" "}
                    {thread.title}
                  </span>
                </SidebarMenuItem>
              </Link>
            ))}
        </SidebarGroup>
        <div className="border-t p-4 flex justify-between items-center">
          {user && (
            <div className="flex flex-col">
              <h1 className="text-sm">{user?.name}</h1>
              <h1 className="text-sm text-neutral-500">{"Free"}</h1>
            </div>
          )}
          <Popover>
            {user && (
              <PopoverTrigger className="hover:cursor-pointer">
                <AiOutlineMore className="w-5 h-5" />
              </PopoverTrigger>
            )}
            <PopoverContent
              className="rounded-none p-2 text-sm flex flex-col mb-4 w-48 items-start gap-2 bg-neutral-950"
              side="top"
              align="end"
            >
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-400 cursor-pointer"
              >
                <AiOutlineRollback />
                Log Out
              </button>
              <button
                onClick={createCustomerPortal}
                className="flex items-center gap-2 cursor-pointer"
              >
                <AiOutlineReload />
                Manage Subscription
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
