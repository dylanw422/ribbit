"use client";
import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@ribbit/backend/convex/_generated/api";
import { useRouter } from "next/navigation";
import CustomTextArea from "@/components/textarea";
import { authClient } from "@/lib/auth-client";
import type { Id } from "@ribbit/backend/convex/_generated/dataModel";

export default function DashboardPage() {
  const router = useRouter();
  const { data } = authClient.useSession();
  const [userText, setUserText] = useState("");
  const [isWoke, setIsWoke] = useState(false);

  const postThread = useMutation(api.messages.startThread);
  const aiCall = useAction(api.messages.streamAssistant);

  const userId = data?.user?.id;

  const handleSubmit = async () => {
    if (userText.length === 0) return;
    if (!userId) return;

    const postThreadRes = await postThread({
      userId: userId,
      title: userText.slice(0, 25),
      userMessage: userText,
      party: isWoke ? "liberal" : "conservative",
    });

    if (postThreadRes) {
      router.push(`/dashboard/${postThreadRes.threadId}`);
      const aiCallRes = await aiCall({
        messageId: postThreadRes.assistantMessageId,
        userMessage: userText,
      });
    }

    setUserText("");
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
