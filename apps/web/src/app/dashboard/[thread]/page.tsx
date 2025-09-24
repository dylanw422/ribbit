"use client";

import { api } from "@ribbit/backend/convex/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";
import { use, useState } from "react";
import type { Id } from "@ribbit/backend/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import CustomTextArea from "@/components/textarea";
import Message from "@/components/message";

export default function ThreadPage({ params }: { params: Promise<{ thread: string }> }) {
  const { thread } = use(params);
  const router = useRouter();
  const [userText, setUserText] = useState("");
  const [isWoke, setIsWoke] = useState(false);

  const threadId = thread as Id<"threads">;
  const messages = useQuery(api.messages.getMessages, { threadId: threadId });
  const addMessage = useMutation(api.messages.addMessageToThread);
  const streamAssistant = useAction(api.messages.streamAssistant);

  const handleSubmit = async () => {
    if (userText.length === 0) return;
    const addMessageRes = await addMessage({
      threadId: threadId,
      userMessage: userText,
      party: isWoke ? "liberal" : "conservative",
    });

    setUserText("");

    if (addMessageRes) {
      const streamAssistantRes = await streamAssistant({
        messageId: addMessageRes.assistantMessageId,
        threadId: threadId,
      });
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Messages */}
      <div className="flex-1">
        {messages?.map((message) => (
          <Message
            key={message._id}
            id={message._id}
            role={message.role}
            text={message.text}
            status={message.status}
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
        />
      </div>
    </div>
  );
}
