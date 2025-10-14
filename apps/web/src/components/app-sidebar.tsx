"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AiFillMessage, AiOutlineFire, AiOutlineSearch } from "react-icons/ai";
import Link from "next/link";
import SidebarDivider from "./ui/sidebar-divider";
import { api } from "@ribbit/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const threadFromPath = pathname.split("/").pop();
  const { data } = authClient.useSession();
  const userId = data?.user?.id;

  const threads = useQuery(api.agentInteractions.allThreads, {
    userId: userId ?? "",
  });

  const heatedThreads = useQuery(api.heated.allHeated);

  const isHeated = (threadId: string) => {
    if (!heatedThreads) return false;
    return heatedThreads.some((heated) => heated.threadId === threadId);
  };

  return (
    <Sidebar>
      <SidebarContent className="bg-black">
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
      </SidebarContent>
    </Sidebar>
  );
}
