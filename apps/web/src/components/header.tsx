import Link from "next/link";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import { api } from "@ribbit/backend/convex/_generated/api";
import { useQuery } from "convex/react";

export default function Header() {
  const user = useQuery(api.auth.getCurrentUser);

  return (
    <div className="w-full h-16 flex items-center justify-between px-12">
      <Link href="/">
        <h1 className="font-mono font-bold tracking-widest">RIBBIT.</h1>
      </Link>
      <div className="flex items-center">
        <Link href={user ? "/dashboard" : "/authenticate/sign-in"}>
          <Button variant={"link"}>Login</Button>
        </Link>
        <Link href={user ? "/dashboard" : "/authenticate/sign-up"}>
          <Button variant={"link"}>Sign Up</Button>
        </Link>
      </div>
    </div>
  );
}
