import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import { AiOutlineEye, AiOutlineLock, AiOutlineMail } from "react-icons/ai";
import { SiApple } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Sign up successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  return (
    <div className="mx-auto w-[400px] mt-10 max-w-md p-6 border bg-black">
      <div className="pb-4 text-center">
        {" "}
        <h1 className="text-2xl">Create Account</h1>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {/* <div>
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label className="font-mono" htmlFor={field.name}>
                  Name
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div> */}

        <div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label className="font-mono" htmlFor={field.name}>
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-8 font-mono"
                  />
                  <AiOutlineMail className="absolute top-1/2 -translate-y-1/2 left-2 text-neutral-500 " />
                </div>

                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label className="font-mono" htmlFor={field.name}>
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-8"
                  />
                  <AiOutlineLock className="absolute top-1/2 -translate-y-1/2 left-2 text-neutral-500 " />
                </div>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full rounded-none mt-12 bg-white"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? "Submitting..." : "Get Started"}
            </Button>
          )}
        </form.Subscribe>
      </form>
      {/* <div className="my-4 text-xs text-neutral-500 flex items-center justify-center gap-2">
        <div className="border-t h-0 flex-1 border-neutral-500" />
        <h1>Or sign in with</h1>
        <div className="border-t h-0 flex-1 border-neutral-500" />
      </div>
      <div className="w-full flex justify-evenly gap-2">
        <Button variant={"outline"} className="flex-1">
          <FcGoogle />
        </Button>
      </div> */}
      <div className="mt-4 text-center">
        <Button
          variant="link"
          onClick={onSwitchToSignIn}
          className="text-neutral-500 hover:text-neutral-400 cursor-pointer"
        >
          Already have an account? Sign In
        </Button>
      </div>
    </div>
  );
}
