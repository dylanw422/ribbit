"use client";

import { api } from "@ribbit/backend/convex/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";
import { use, useState } from "react";
import type { Id } from "@ribbit/backend/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import CustomTextArea from "@/components/textarea";
import Message from "@/components/message";
import { useUIMessages } from "@convex-dev/agent/react";
import { send } from "process";

export default function ThreadPage({ params }: { params: Promise<{ thread: string }> }) {
  const { thread } = use(params);
  const [userText, setUserText] = useState("");
  const [isWoke, setIsWoke] = useState(false);

  const { results, status, loadMore } = useUIMessages(
    api.agentInteractions.listThreadMessages,
    { threadId: String(thread) },
    { initialNumItems: 10, stream: true }
  );
  const sendMessage = useAction(api.agentInteractions.continueThread);

  const handleSubmit = async () => {
    sendMessage({ threadId: String(thread), prompt: userText });
    setUserText("");
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Messages */}
      <div className="flex-1">
        {results?.map((message) => (
          <Message
            key={message.key}
            id={message.id as any}
            role={message.role}
            text={message.text}
            status={message.status as any}
          />
        ))}
      </div>

      <div className="sticky bottom-0 pb-4 bg-black">
        <CustomTextArea
          isWoke={isWoke}
          setIsWoke={setIsWoke}
          userText={userText}
          setUserText={setUserText}
          handleSubmit={handleSubmit}
          threadId={thread}
        />
      </div>
    </div>
  );
}
