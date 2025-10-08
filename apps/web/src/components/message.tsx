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
}: {
  id: Id<"_storage">;
  role: "user" | "assistant" | "system";
  text: string;
  status: "pending" | "streaming" | "done" | "error";
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
        <div className="mt-4 flex space-x-4 [&>*]:size-5 [&>*]:hover:cursor-pointer text-neutral-400">
          {copied ? (
            <AiOutlineCheck className="animate transition-all" />
          ) : (
            <AiOutlineCopy className="animate transition-all" onClick={handleCopy} />
          )}
          <AiOutlineSplitCells />
          <AiOutlineFire className="text-orange-700" />
        </div>
      )}
    </div>
  );
}
