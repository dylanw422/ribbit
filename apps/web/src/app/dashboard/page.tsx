"use client";
import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@ribbit/backend/convex/_generated/api";
import { useRouter } from "next/navigation";
import CustomTextArea from "@/components/textarea";
import { authClient } from "@/lib/auth-client";
import { optimisticallySendMessage } from "@convex-dev/agent/react";

export default function DashboardPage() {
  const router = useRouter();
  const { data } = authClient.useSession();
  const [userText, setUserText] = useState("");
  const [isWoke, setIsWoke] = useState(false);

  const newThread = useAction(api.agentInteractions.newThread);
  const sendMessage = useMutation(
    api.agentInteractions.initiateAsyncStreaming
  ).withOptimisticUpdate(optimisticallySendMessage(api.agentInteractions.listThreadMessages));

  const userId = data?.user?.id;

  const handleSubmit = async () => {
    if (!userId) return;
    const thread = await newThread({ userId, prompt: userText });
    router.push(`/dashboard/${thread.threadId}`);
    await sendMessage({
      threadId: String(thread.threadId),
      prompt: userText,
      isFirstMessage: true,
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 flex justify-center items-center text-neutral-500">
        <h1>No messages yet</h1>
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
