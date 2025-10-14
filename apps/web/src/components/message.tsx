import type { Id } from "@ribbit/backend/convex/_generated/dataModel";
import {
  AiOutlineAlert,
  AiOutlineCheck,
  AiOutlineCopy,
  AiOutlineFire,
  AiOutlineSplitCells,
} from "react-icons/ai";
import { Response } from "./ui/shadcn-io/ai/response";
import { useSmoothText } from "@convex-dev/agent/react";
import { useState } from "react";

export default function Message({
  id,
  role,
  text,
  status,
  setIsDialogOpen,
  setIsComparisonOpen,
  setSelectedMessage,
  isHeated,
}: {
  id: Id<"_storage">;
  role: "user" | "assistant" | "system";
  text: string;
  status: "pending" | "streaming" | "done" | "error";
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  setIsComparisonOpen: (isComparisonOpen: boolean) => void;
  setSelectedMessage: (selectedMessage: string | null) => void;
  isHeated?: boolean;
}) {
  const [visibleText] = useSmoothText(text, {
    startStreaming: status === "streaming",
  });
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`my-4 flex flex-col ${
        role === "assistant" ? "items-start" : "items-end"
      } ${text.length > 0 ? "" : "opacity-0"}`}
    >
      <h1
        id="message-container"
        className={`px-4 py-2 max-w-3/4 ${
          role === "assistant" ? "bg-neutral-900" : "bg-black border"
        }`}
      >
        <Response>{visibleText}</Response>
      </h1>
      {role === "assistant" && (
        <div className="mt-4 flex space-x-4 [&>*]:size-5 text-neutral-400">
          {copied ? (
            <AiOutlineCheck className="animate transition-all" />
          ) : (
            <AiOutlineCopy className="animate transition-all" onClick={handleCopy} />
          )}
          <button
            disabled={isHeated}
            onClick={() => {
              setIsComparisonOpen(true);
              setSelectedMessage(text);
            }}
            className="hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <AiOutlineSplitCells className="w-full h-full" />
          </button>
          <button
            className="hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isHeated}
            onClick={() => {
              setIsDialogOpen(true);
              setSelectedMessage(text);
            }}
          >
            <AiOutlineFire className="w-full h-full text-orange-700" />
          </button>
        </div>
      )}
    </div>
  );
}
