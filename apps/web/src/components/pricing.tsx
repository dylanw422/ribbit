import { AiOutlineCheck } from "react-icons/ai";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@ribbit/backend/convex/_generated/api";
import { useCheckout } from "@/lib/checkout";

export default function Pricing({ user }: { user: any }) {
  const router = useRouter();
  // const createCheckout = useAction(api.payments.createCheckout);
  const { handleCheckout } = useCheckout();

  const freeItems = [
    "10 messages per day",
    "20 threads",
    "Slow response times",
    "Limited context",
    "Single bias per thread",
  ];

  const proItems = [
    "Unlimited messages",
    "Unlimited threads",
    "Fast response times",
    "Full context",
    "Dynamic bias per message",
    "Side-by-side comparison",
    "AI debate mode",
  ];

  // const handleCheckout = async () => {
  //   const { checkout_url } = await createCheckout({
  //     userId: user?._id,
  //     customer: user?.email,
  //     product_cart: [
  //       {
  //         product_id:
  //           process.env.NODE_ENV === "development"
  //             ? "pdt_glgVUbawfIQCGOo9I7Jkr"
  //             : "pdt_QUCHzPrjVIpp7gnvkoIbo",
  //         quantity: 1,
  //       },
  //     ],
  //     returnUrl:
  //       process.env.NODE_ENV === "development"
  //         ? "http://localhost:3001/dashboard"
  //         : "https://ribbit-web.vercel.app/dashboard",
  //   });
  //   window.location.href = checkout_url;
  // };

  return (
    <div className="flex justify-evenly w-full space-x-8">
      <div id="free" className="border bg-neutral-950 p-4 w-full">
        <h1 className="tracking-wider text-xl">Free</h1>
        <div className="border-t w-full mx-auto my-4" />
        <div className="space-y-2">
          {freeItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <AiOutlineCheck />
              <p key={item}>{item}</p>
            </div>
          ))}
        </div>
      </div>
      <div id="paid" className="border p-4 w-full bg-neutral-950">
        <h1 className="tracking-wider text-xl">Pro</h1>
        <div className="border-t w-full mx-auto my-4" />
        <div className="space-y-2">
          {proItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <AiOutlineCheck />
              <p key={item}>{item}</p>
            </div>
          ))}
        </div>

        {!user ? (
          <Button
            onClick={() => router.push("/authenticate/sign-in")}
            className="w-full mt-4 bg-white"
          >
            SIGN IN
          </Button>
        ) : (
          <Button onClick={handleCheckout} className="w-full mt-4 bg-white">
            UPGRADE
          </Button>
        )}
      </div>
    </div>
  );
}
