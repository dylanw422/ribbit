"use client";
import { api } from "@ribbit/backend/convex/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";
import { use, useEffect, useState } from "react";
import CustomTextArea from "@/components/textarea";
import Message from "@/components/message";
import { useUIMessages, optimisticallySendMessage } from "@convex-dev/agent/react";
import { useParty } from "@/components/providers";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
// import { Response } from "@/components/ui/shadcn-io/ai/response";
import { Response } from "@/components/ai-elements/response";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export default function ThreadPage({ params }: { params: Promise<{ thread: string }> }) {
  const router = useRouter();
  const { thread } = use(params);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [userText, setUserText] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const { isWoke, setIsWoke } = useParty();
  const user = useQuery(api.auth.getCurrentUser);
  const userId = user?._id;
  const messageBiases = useQuery(api.messages.getThreadMessagesBias, {
    threadId: String(thread),
  });
  const isHeated = useQuery(api.heated.isHeated, { threadId: String(thread) });
  const threads = useQuery(api.agentInteractions.allThreads, {
    userId: userId ?? "",
  });

  const { results, status, loadMore } = useUIMessages(
    api.agentInteractions.listThreadMessages,
    { threadId: String(thread) },
    { initialNumItems: 5000, stream: true }
  );
  const messages = isHeated ? results.slice(1, results.length) : results;

  const sendMessage = useMutation(
    api.agentInteractions.initiateAsyncStreaming
  ).withOptimisticUpdate(optimisticallySendMessage(api.agentInteractions.listThreadMessages));

  const newThread = useAction(api.agentInteractions.newThread);

  // --- FUNCTIONS ---
  const handleSubmit = async () => {
    sendMessage({
      threadId: String(thread),
      prompt: userText,
      party: isWoke ? "liberal" : "conservative",
      debate: isHeated ? true : false,
    });
    setUserText("");
    const scrollableElement = document.querySelector("#scroll-container");
    if (scrollableElement) {
      scrollableElement.scrollTo({ top: scrollableElement.scrollHeight - 200, behavior: "smooth" });
    }
  };

  const handleHeatedConfirm = async () => {
    if (!userId) return;
    const thread = await newThread({ userId: userId, prompt: userText, isHeated: true });
    sendMessage({
      threadId: String(thread.threadId),
      prompt: "YOUR POSITION: " + selectedMessage + "\n\n" + "DEFEND YOUR POSITION.",
      party: isWoke ? "liberal" : "conservative",
      isFirstMessage: true,
      debate: true,
    });

    router.push(`/dashboard/${thread.threadId}`);
  };

  useEffect(() => {
    const scrollableElement = document.querySelector("#scroll-container");
    if (scrollableElement && results[results.length - 1]?.role === "user") {
      scrollableElement.scrollTo({
        top: scrollableElement.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [results]);

  if (!user) return null;

  // --- HELPERS ---
  const lastMessage = results?.[results.length - 1];
  const userHasThread = threads?.threads?.page?.some((t) => t._id === String(thread)) ?? false;
  const selectedMessageBias = messageBiases?.find(
    (m) => m.messageId === String(selectedMessage)
  )?.bias;
  const selectedMessageComparison = messageBiases?.find(
    (m) => m.messageId === String(selectedMessage)
  )?.comparisonResponse;
  const selectedMessageText = results?.find((m) => m.id === String(selectedMessage))?.text;
  const comparisionBgColor = selectedMessageBias === "liberal" ? "bg-blue-400/20" : "bg-red-400/20";
  const oppositeBgColor = selectedMessageBias === "liberal" ? "bg-red-400/20" : "bg-blue-400/20";

  return (
    <div id="messages-container" className="flex flex-col h-full">
      {/* Messages */}
      <div className={`flex-1 ${results[results.length - 1]?.role === "user" ? "pb-12" : ""}`}>
        {isHeated && (
          <div className="w-full flex sticky justify-center top-0 select-none">
            <h1 className="text-center py-1 px-4 bg-orange-600 border border-orange-500 border-t-orange-600 text-black font-bold text-xs">
              THIS IS A DEBATE THREAD
            </h1>
          </div>
        )}
        {!userHasThread && (
          <h1 className="w-full h-full flex justify-center items-center text-neutral-500">
            This thread is private.
          </h1>
        )}
        {userHasThread &&
          messages?.map((message) => (
            <Message
              key={message.key}
              id={message.id as any}
              role={message.role}
              text={message.text}
              status={message.status as any}
              setIsDialogOpen={setIsDialogOpen}
              setIsComparisonOpen={setIsComparisonOpen}
              setSelectedMessage={setSelectedMessage}
              isHeated={isHeated}
              threadId={thread}
            />
          ))}
      </div>
      <div className="sticky bottom-0">
        <CustomTextArea
          isWoke={isWoke}
          setIsWoke={setIsWoke}
          userText={userText}
          setUserText={setUserText}
          handleSubmit={handleSubmit}
          messageStatus={lastMessage?.status}
          isPrivate={!userHasThread}
          isHeated={isHeated}
          isFree={user.isFree}
        />
      </div>
      {/* Bias Comparison Dialog */}
      {/* Bias Comparison Dialog */}
      <Dialog open={isComparisonOpen} onOpenChange={setIsComparisonOpen}>
        {" "}
        <DialogContent className="rounded-none max-h-[90vh] sm:max-h-[70vh] min-w-[75%] flex flex-col">
          <DialogTitle className="">Bias Comparison</DialogTitle>
          <h1 className="italic">This is a comparison of left and right biased responses.</h1>

          {/* Scrollable container */}
          <div className="flex sm:flex-row flex-col gap-4 flex-1 overflow-hidden">
            <div
              className={`w-full sm:w-1/2 border-2 p-2 overflow-auto ${comparisionBgColor} text-white`}
            >
              <Response>{selectedMessageText}</Response>
            </div>
            <div
              className={`w-full sm:w-1/2 border-2 p-2 overflow-auto ${oppositeBgColor} text-white`}
            >
              {selectedMessageComparison ? (
                <Response>{selectedMessageComparison}</Response>
              ) : (
                <div className="flex items-center justify-center w-full h-full gap-2 text-neutral-400">
                  <Spinner className="size-5" />
                  <h1>Generating response...</h1>
                </div>
              )}
            </div>
          </div>

          <DialogFooter />
        </DialogContent>
      </Dialog>

      {/* Heated Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-none">
          <DialogTitle className="pr-4 leading-6">
            Are you sure you want to start a{" "}
            <span className="text-orange-600 italic font-bold">HEATED</span> debate?
          </DialogTitle>
          <h1>
            If you disagree with the response, this will start a new thread where the model will
            aggressively try to sway your opinion.
          </h1>
          <h1 className="border p-2 rounded-sm border-l-8 border-neutral-800 italic text-sm">
            "{selectedMessage?.split(" ").slice(0, 25).join(" ")}..."
          </h1>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleHeatedConfirm} className="bg-orange-600 hover:bg-orange-500">
              Start Debate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
