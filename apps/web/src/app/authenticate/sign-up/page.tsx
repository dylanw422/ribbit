"use client";
import SignUpForm from "@/components/sign-up-form";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const switchToSignIn = async () => {
    router.push("/authenticate/sign-in");
  };

  return (
    <div>
      <SignUpForm onSwitchToSignIn={switchToSignIn} />
    </div>
  );
}
