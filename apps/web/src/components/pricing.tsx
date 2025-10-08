import { AiOutlineCheck } from "react-icons/ai";
import { Button } from "./ui/button";

export default function Pricing() {
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

  return (
    <div className="flex justify-evenly w-full space-x-8">
      <div id="free" className="border p-4 w-full">
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
      <div id="free" className="border p-4 w-full">
        {" "}
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
        <Button className="w-full mt-4 bg-white">UPGRADE</Button>
      </div>
    </div>
  );
}
