import Link from "next/link";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";

export default function Header() {
  const { data } = authClient.useSession();

  return (
    <div className="w-full h-16 flex items-center justify-between px-12">
      <Link href="/">
        <h1 className="font-mono font-bold tracking-widest">RIBBIT.</h1>
      </Link>
      <div className="flex items-center">
        <Link href={data ? "/dashboard" : "/authenticate/sign-in"}>
          <Button variant={"link"}>Login</Button>
        </Link>
        <Link href={data ? "/dashboard" : "/authenticate/sign-up"}>
          <Button variant={"link"}>Sign Up</Button>
        </Link>
      </div>
    </div>
  );
}
