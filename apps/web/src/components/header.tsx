import Link from "next/link";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";

export default function Header() {
  const { data, isPending } = authClient.useSession();

  return (
    <div className="w-full h-16 flex items-center justify-between px-12">
      <Link href="/">
        <h1 className="font-mono font-bold tracking-widest">RIBBIT.</h1>
      </Link>
      {!data && !isPending ? (
        <div className="flex items-center">
          <Link href={"/authenticate/sign-in"}>
            <Button variant={"link"}>Login</Button>
          </Link>
          <Link href={"/authenticate/sign-up"}>
            <Button variant={"link"}>Sign Up</Button>
          </Link>
        </div>
      ) : (
        <Link href={"/dashboard"}>
          <Button variant={"link"}>New Chat</Button>
        </Link>
      )}
    </div>
  );
}
