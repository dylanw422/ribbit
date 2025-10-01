import { v } from "convex/values";
import { api, components, internal } from "./_generated/api";
import { createThread, listUIMessages, syncStreams, vStreamArgs } from "@convex-dev/agent";
import { action, internalAction, mutation, query } from "./_generated/server";
import { agent } from "./agent";
import { paginationOptsValidator } from "convex/server";
import { rag } from "./rag";

export const newThread = action({
  args: { userId: v.string(), prompt: v.string() },
  handler: async (ctx, args) => {
    const threadId = await createThread(ctx, components.agent, {
      userId: args.userId,
      title: "New Conversation",
    });

    return { threadId };
  },
});

export const continueThread = action({
  args: { threadId: v.string(), prompt: v.string(), isFirstMessage: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    // authorize thread access
    // await authorizeThreadAccess(ctx, args.threadId);
    const context = await rag.search(ctx, {
      namespace: "global",
      query: args.prompt,
      limit: 10,
    });

    const { thread } = await agent.continueThread(ctx, { threadId: args.threadId });
    await thread.streamText({ prompt: args.prompt }, { saveStreamDeltas: true });

    if (args.isFirstMessage) {
      await ctx.runAction(api.agentInteractions.generateThreadTitle, { threadId: args.threadId });
    }
  },
});

// --- Mutations ---
export const allThreads = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const threads = await ctx.runQuery(components.agent.threads.listThreadsByUserId, {
      userId: args.userId,
    });

    return { threads };
  },
});

export const listThreadMessages = query({
  args: { threadId: v.string(), paginationOpts: paginationOptsValidator, streamArgs: vStreamArgs },
  handler: async (ctx, args) => {
    // authorize thread access
    // await authorizeThreadAccess(ctx, args.threadId);
    const paginated = await listUIMessages(ctx, components.agent, args);
    const streams = await syncStreams(ctx, components.agent, args);

    // Here you could filter out / modify the documents
    return { ...paginated, streams };
  },
});

// --- Helpers ---
export const generateThreadTitle = action({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    // Generate a title based on the thread's conversation so far
    const result = await agent.generateText(
      ctx,
      { threadId },
      {
        prompt:
          "Generate a concise, descriptive title for this conversation. Only respond with the title, nothing else. 3-5 words.",
        maxOutputTokens: 10,
      },
      { storageOptions: { saveMessages: "none" } }
    );

    const { thread } = await agent.continueThread(ctx, { threadId });
    await thread.updateMetadata({ title: result.text });
    return result.text;
  },
});
