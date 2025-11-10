"use client";
import { AiOutlineArrowUp, AiOutlineRetweet } from "react-icons/ai";
import { Textarea } from "./ui/textarea";
import { useScroll } from "./scroll-provider";
import { useEffect, useState } from "react";
import { api } from "@ribbit/backend/convex/_generated/api";
import { useAction } from "convex/react";
import { useCheckout } from "@/lib/checkout";

export default function CustomTextArea({
  isWoke,
  setIsWoke,
  userText,
  setUserText,
  handleSubmit,
  messageStatus,
  isPrivate,
  isHeated,
  isPro,
}: {
  isWoke: boolean;
  setIsWoke: (isWoke: boolean) => void;
  userText: string;
  setUserText: (userText: string) => void;
  handleSubmit: () => void;
  messageStatus?: string;
  isPrivate?: boolean;
  isHeated?: boolean;
  isPro?: boolean;
}) {
  const { hasScroll, scrollHeight } = useScroll();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const disabled = userText.length === 0 || messageStatus === "streaming";
  const { handleCheckout } = useCheckout();

  useEffect(() => {
    const scrollableElement = document.querySelector("#scroll-container");
    if (!scrollableElement) return;

    const handleScrollCheck = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollableElement;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollButton(distanceFromBottom > 200);
    };

    handleScrollCheck();
    scrollableElement.addEventListener("scroll", handleScrollCheck);

    return () => {
      scrollableElement.removeEventListener("scroll", handleScrollCheck);
    };
  }, [hasScroll, scrollHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent newline
      if (!disabled) {
        handleSubmit();
      }
    }
  };

  const handleScroll = () => {
    // Find the scrollable element and scroll it to bottom
    const scrollableElement = document.querySelector("#scroll-container");
    if (scrollableElement) {
      scrollableElement.scrollTo({ top: scrollHeight - 200, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full">
      {hasScroll && showScrollButton && (
        <div className="w-full flex justify-center mb-2 text-sm">
          <button
            onMouseDown={handleScroll}
            className="px-4 py-2 border bg-neutral-950 font-bold hover:cursor-pointer text-xs"
          >
            SCROLL TO BOTTOM
          </button>
        </div>
      )}

      <div className="py-2 px-4 border-l border-t border-r bg-neutral-950 text-sm mr-4 flex items-center justify-between gap-2">
        <h1
          className={`font-bold font-mono text-xs tracking-widest ${isWoke ? "text-blue-400" : "text-red-400"} ${isHeated ? "opacity-50" : ""}`}
        >
          {isWoke ? "LIBERAL" : "CONSERVATIVE"}
        </h1>
        <button
          disabled={isHeated}
          className="hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setIsWoke(!isWoke)}
        >
          <AiOutlineRetweet className="size-4" />
        </button>
      </div>
      <div className="relative">
        <Textarea
          value={userText}
          onKeyDown={handleKeyDown}
          disabled={isPrivate}
          onChange={(e) => setUserText(e.target.value)}
          placeholder={"Controversy is a form of communication..."}
          className="max-h-[250px] rounded-none bg-neutral-950 w-full p-2 text-sm resize-none pr-[60px]"
        />
        <button
          disabled={disabled}
          onClick={handleSubmit}
          className="absolute bottom-4 right-4 hover:cursor-pointer disabled:cursor-not-allowed"
        >
          <AiOutlineArrowUp className={`size-8 p-1 ${disabled ? "opacity-50" : "opacity-100"}`} />
        </button>
      </div>
      <div className="flex justify-between items-center pt-2 bg-black pb-4">
        <h1 className="text-xs text-neutral-500">Shift + Enter to break</h1>

        {!isPro && (
          <button
            onClick={handleCheckout}
            className="text-xs text-purple-400 font-mono font-semibold tracking-wider hover:cursor-pointer"
          >
            UPGRADE
          </button>
        )}
      </div>
    </div>
  );
}
