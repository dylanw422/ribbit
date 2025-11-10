import { api } from "@ribbit/backend/convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useCheckout() {
  const user = useQuery(api.auth.getCurrentUser);
  const createCheckout = useAction(api.payments.createCheckout);

  const handleCheckout = async () => {
    if (!user) return;
    if (user.pro) {
      toast.success("You are already subscribed!");
      return;
    }
    const { checkout_url } = await createCheckout({
      userId: user?._id,
      customer: user?.email,
      product_cart: [
        {
          product_id:
            process.env.NODE_ENV === "development"
              ? "pdt_glgVUbawfIQCGOo9I7Jkr"
              : "pdt_QUCHzPrjVIpp7gnvkoIbo",
          quantity: 1,
        },
      ],
      returnUrl:
        process.env.NODE_ENV === "development"
          ? "http://localhost:3001/dashboard"
          : "https://ribbit-web.vercel.app/dashboard",
    });

    window.location.href = checkout_url;
  };

  return { handleCheckout };
}
