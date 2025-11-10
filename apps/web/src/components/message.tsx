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
import { useAction, useQuery } from "convex/react";
import { api } from "@ribbit/backend/convex/_generated/api";

export default function Message({
  id,
  role,
  text,
  status,
  setIsDialogOpen,
  setIsComparisonOpen,
  setSelectedMessage,
  isHeated,
  threadId,
}: {
  id: Id<"_storage">;
  role: "user" | "assistant" | "system";
  text: string;
  status: "pending" | "streaming" | "done" | "error";
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  setIsComparisonOpen: (isComparisonOpen: boolean) => void;
  setSelectedMessage: (selectedMessage: string | null) => void;
  isHeated?: boolean;
  threadId: string;
}) {
  const messageBiases = useQuery(api.messages.getThreadMessagesBias, {
    threadId: String(threadId),
  });
  const politicalMessages = useQuery(api.political.threadsPoliticalMessages, {
    threadId: String(threadId),
  });
  const [visibleText] = useSmoothText(text, {
    startStreaming: status === "streaming",
  });
  const [copied, setCopied] = useState(false);
  const generateComparison = useAction(api.messages.generateComparisonResponse);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateComparisonIfNeeded = async () => {
    const comparisonResponse = messageBiases?.find((m) => m.messageId === id)?.comparisonResponse;
    if (comparisonResponse) return;
    // Generate a comparison response and update in db
    generateComparison({ threadId: threadId, messageId: id, messageText: text });
  };

  const isPolitical = politicalMessages?.some((m) => m.messageId === id);

  const messageBias = messageBiases?.find((m) => m.messageId === id)?.bias;

  return (
    <div
      className={`my-4 flex flex-col ${
        role === "assistant" ? "items-start" : "items-end"
      } ${text.length > 0 ? "" : "opacity-0"}`}
    >
      <h1
        id="message-container"
        className={`px-4 py-2 max-w-5/6 sm:max-w-3/4 ${
          role === "assistant"
            ? `bg-neutral-900 ${messageBias === "liberal" ? "border-b border-blue-400/50" : "border-b border-red-400/50"}`
            : "bg-black border"
        }`}
      >
        <Response>{visibleText}</Response>
      </h1>
      {role === "assistant" && (
        <div className="mt-4 flex space-x-4 [&>*]:size-5 text-neutral-400">
          {copied ? (
            <AiOutlineCheck className="animate transition-all" />
          ) : (
            <AiOutlineCopy
              className="animate transition-all hover:cursor-pointer"
              onClick={handleCopy}
            />
          )}
          <button
            disabled={isHeated || !isPolitical}
            onClick={() => {
              setIsComparisonOpen(true);
              setSelectedMessage(id);
              generateComparisonIfNeeded();
            }}
            className="hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <AiOutlineSplitCells className="w-full h-full" />
          </button>
          <button
            className="hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isHeated || !isPolitical}
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
