"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AiFillMessage, AiOutlineSearch } from "react-icons/ai";
import Link from "next/link";
import SidebarDivider from "./ui/sidebar-divider";
import { use } from "react";
import { api } from "@ribbit/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { authClient } from "@/lib/auth-client";

export function AppSidebar() {
  const { data } = authClient.useSession();
  const userId = data?.user?.id;

  const threads = useQuery(api.messages.getThreads, {
    userId: userId ?? "",
  });

  return (
    <Sidebar>
      <SidebarContent className="bg-black">
        <SidebarHeader>ribbit</SidebarHeader>
        <SidebarGroup className="text-sm space-y-2">
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
        <h1 className="text-xs font-bold text-neutral-500 pl-3">Conversations</h1>{" "}
        <SidebarGroup className="text-sm space-y-2">
          {threads?.map((thread) => (
            <Link key={thread._id} href={`/dashboard/${thread._id}`}>
              <SidebarMenuItem>{thread.title}</SidebarMenuItem>
            </Link>
          ))}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
