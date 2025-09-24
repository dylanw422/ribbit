import { api } from "@ribbit/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import type { Id } from "@ribbit/backend/convex/_generated/dataModel";
import { AiOutlineCopy, AiOutlineDislike, AiOutlineExport, AiOutlineLike } from "react-icons/ai";
import MarkdownRenderer from "./ui/markdown-renderer";
import { Response } from "./ui/shadcn-io/ai/response";

export default function Message({
  id,
  role,
  text,
  status,
}: {
  id: Id<"messages">;
  role: "user" | "assistant" | "system";
  text: string;
  status: "pending" | "streaming" | "done" | "error";
}) {
  const chunks = useQuery(api.messages.getChunks, { messageId: id });

  const displayText =
    role === "assistant" && status === "streaming" && chunks
      ? chunks.map((c) => c.content).join("")
      : text;

  return (
    <div
      className={`my-4 flex flex-col ${
        role === "assistant" ? "items-start" : "items-end"
      } ${displayText.length > 0 ? "" : "opacity-0"}`}
    >
      <h1
        id="message-container"
        className={`px-4 py-2 max-w-3/4 ${
          role === "assistant" ? "bg-neutral-900" : "bg-black border"
        }`}
      >
        <Response>{displayText}</Response>
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
