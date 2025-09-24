import { mutation, action, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";

// --- Mutation to start a new thread ---
export const startThread = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    userMessage: v.string(),
    party: v.union(v.literal("liberal"), v.literal("conservative")),
  },
  handler: async (ctx, args) => {
    // 1. Create new thread
    const threadId = await ctx.db.insert("threads", {
      title: args.title,
      userId: args.userId,
      archived: false,
    });

    // 2. Insert user message
    const userMessageId = await ctx.db.insert("messages", {
      threadId,
      role: "user",
      party: args.party,
      text: args.userMessage,
      status: "done",
    });

    // 3. Insert assistant placeholder
    const assistantMessageId = await ctx.db.insert("messages", {
      threadId,
      role: "assistant",
      party: args.party,
      text: "",
      status: "pending",
    });

    return { threadId, userMessageId, assistantMessageId };
  },
});

// --- Mutation to add a new message to an existing thread ---
export const addMessageToThread = mutation({
  args: {
    threadId: v.id("threads"),
    userMessage: v.string(),
    party: v.union(v.literal("liberal"), v.literal("conservative")),
  },
  handler: async (ctx, args) => {
    // 1. Insert user message
    const userMessageId = await ctx.db.insert("messages", {
      threadId: args.threadId,
      role: "user",
      party: args.party,
      text: args.userMessage,
      status: "done",
    });

    // 2. Insert assistant placeholder
    const assistantMessageId = await ctx.db.insert("messages", {
      threadId: args.threadId,
      role: "assistant",
      party: args.party,
      text: "",
      status: "pending",
    });

    return { userMessageId, assistantMessageId };
  },
});

// --- Stream assistant reply ---
export const streamAssistant = action({
  args: {
    messageId: v.id("messages"), // assistant message id
    userMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const venice = createOpenAICompatible({
      name: "venice",
      apiKey: process.env.VENICE_API_KEY,
      baseURL: "https://api.venice.ai/api/v1",
      includeUsage: true,
    });

    // Mark assistant message as "streaming"
    await ctx.runMutation(api.messages.updateMessageStatus, {
      messageId: args.messageId,
      status: "streaming",
    });

    // Call Venice model
    const result = streamText({
      model: venice("venice-uncensored"),
      messages: [{ role: "user", content: args.userMessage }],
    });

    let index = 0;
    let buffer = "";

    for await (const delta of result.textStream) {
      buffer += delta;

      await ctx.runMutation(api.messages.appendChunk, {
        messageId: args.messageId,
        content: delta,
        index,
      });

      index++;
    }

    // Finalize message
    await ctx.runMutation(api.messages.finalizeMessage, {
      messageId: args.messageId,
      text: buffer,
    });
  },
});

// --- Supporting mutations ---
export const updateMessageStatus = mutation({
  args: {
    messageId: v.id("messages"),
    status: v.union(
      v.literal("pending"),
      v.literal("streaming"),
      v.literal("done"),
      v.literal("error")
    ),
  },
  handler: async (ctx, { messageId, status }) => {
    await ctx.db.patch(messageId, { status });
  },
});

export const appendChunk = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    index: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messageChunks", {
      messageId: args.messageId,
      content: args.content,
      index: args.index,
    });
  },
});

export const finalizeMessage = mutation({
  args: { messageId: v.id("messages"), text: v.string() },
  handler: async (ctx, args) => {
    // 1. Update the main message
    await ctx.db.patch(args.messageId, {
      text: args.text,
      status: "done",
    });

    // 2. Delete all chunks for this message
    const chunks = await ctx.db
      .query("messageChunks")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .collect();

    await Promise.all(chunks.map((chunk) => ctx.db.delete(chunk._id)));
  },
});

// --- Queries ---
export const getMessages = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();
  },
});

export const getThreads = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("threads")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
  },
});

export const getChunks = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messageChunks")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .order("asc")
      .collect();
  },
});
