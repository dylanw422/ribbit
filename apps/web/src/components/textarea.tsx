"use client";
import { AiOutlineArrowUp, AiOutlinePicture, AiOutlineRetweet } from "react-icons/ai";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { X } from "lucide-react";

export default function CustomTextArea({
  isWoke,
  setIsWoke,
  userText,
  setUserText,
  handleSubmit,
  messageStatus,
}: {
  isWoke: boolean;
  setIsWoke: (isWoke: boolean) => void;
  userText: string;
  setUserText: (userText: string) => void;
  handleSubmit: () => void;
  messageStatus?: string;
}) {
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [imageUpload, setImageUpload] = useState<boolean>(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent newline
      if (true) {
        handleSubmit();
      }
    }
  };

  const handleImageUpload = () => {
    setImageUpload(!imageUpload);
  };

  const disabled = userText.length === 0 || messageStatus === "streaming";

  return (
    <div className="w-full">
      <div className="py-2 px-4 border-l border-t border-r bg-neutral-950 text-sm mr-4 flex items-center justify-between gap-2">
        <h1
          className={`font-bold font-mono text-xs tracking-widest ${isWoke ? "text-blue-300" : "text-red-300"}`}
        >
          {isWoke ? "WOKE" : "GROYPER"}
        </h1>
        <button className="hover:cursor-pointer" onClick={() => setIsWoke(!isWoke)}>
          <AiOutlineRetweet className="size-4" />
        </button>
      </div>
      <div className="relative">
        <Textarea
          value={userText}
          onKeyDown={handleKeyDown}
          onChange={(e) => setUserText(e.target.value)}
          placeholder={
            imageUpload
              ? "Your imagination is the limit..."
              : "Controversy is a form of communication..."
          }
          className="rounded-none bg-neutral-950/50 w-full p-2 text-sm resize-none pr-[60px]"
        />
        <button
          disabled={disabled}
          onClick={handleSubmit}
          className="absolute bottom-4 right-4 hover:cursor-pointer disabled:cursor-not-allowed"
        >
          <AiOutlineArrowUp className={`size-8 p-1 ${disabled ? "opacity-50" : "opacity-100"}`} />
        </button>
      </div>
      <div className="flex justify-between items-center pt-2">
        <h1 className="text-xs text-neutral-500">Shift + Enter to break</h1>
        <h1 className="text-xs text-purple-300 font-mono font-semibold tracking-wider">UPGRADE</h1>
      </div>
    </div>
  );
}
