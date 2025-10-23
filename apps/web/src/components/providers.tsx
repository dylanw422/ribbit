"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { SidebarProvider } from "./ui/sidebar";
import { createContext, useContext, useState } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
  expectAuth: true,
});

type PartyContextType = {
  isWoke: boolean;
  setIsWoke: (isWoke: boolean) => void;
};

const PartyContext = createContext<PartyContextType | undefined>(undefined);

export function useParty() {
  const context = useContext(PartyContext);
  if (!context) throw new Error("useParty must be used within a PartyProvider");
  return context;
}

function PartyProvider({ children }: { children: React.ReactNode }) {
  const [isWoke, setIsWoke] = useState<boolean>(false);
  return <PartyContext.Provider value={{ isWoke, setIsWoke }}>{children}</PartyContext.Provider>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
        <SidebarProvider>
          <PartyProvider>{children}</PartyProvider>
        </SidebarProvider>
        <Toaster richColors />
      </ThemeProvider>
    </ConvexBetterAuthProvider>
  );
}
