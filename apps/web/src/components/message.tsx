import { api } from "@ribbit/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import type { Id } from "@ribbit/backend/convex/_generated/dataModel";
import { AiOutlineCopy, AiOutlineDislike, AiOutlineExport, AiOutlineLike } from "react-icons/ai";
import MarkdownRenderer from "./ui/markdown-renderer";
import { Response } from "./ui/shadcn-io/ai/response";
import { useSmoothText, type UIMessage } from "@convex-dev/agent/react";

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
        <div className="mt-4 flex space-x-2 [&>*]:hover:cursor-pointer  text-neutral-400">
          <AiOutlineCopy />
          <AiOutlineLike />
          <AiOutlineDislike />
        </div>
      )}
    </div>
  );
}
