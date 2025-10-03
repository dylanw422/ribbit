"use client";
import { api } from "@ribbit/backend/convex/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";
import { use, useRef, useState, useEffect } from "react";
import CustomTextArea from "@/components/textarea";
import Message from "@/components/message";
import { useUIMessages, optimisticallySendMessage } from "@convex-dev/agent/react";

export default function ThreadPage({ params }: { params: Promise<{ thread: string }> }) {
  const { thread } = use(params);
  const [userText, setUserText] = useState("");
  const [isWoke, setIsWoke] = useState(false);

  const { results, status, loadMore } = useUIMessages(
    api.agentInteractions.listThreadMessages,
    { threadId: String(thread) },
    { initialNumItems: 5000, stream: true }
  );

  const sendMessage = useMutation(
    api.agentInteractions.initiateAsyncStreaming
  ).withOptimisticUpdate(optimisticallySendMessage(api.agentInteractions.listThreadMessages));

  const handleSubmit = async () => {
    sendMessage({ threadId: String(thread), prompt: userText });
    setUserText("");
  };

  const lastMessage = results?.[results.length - 1];

  return (
    <div id="messages-container" className="flex flex-col h-full">
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
          messageStatus={lastMessage?.status}
        />
      </div>
    </div>
  );
}
