"use client";
import SignInForm from "@/components/sign-in-form";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();

  const switchToSignUp = async () => {
    router.push("/authenticate/sign-up");
  };

  return (
    <div>
      <SignInForm onSwitchToSignUp={switchToSignUp} />
    </div>
  );
}
