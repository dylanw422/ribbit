import { mutation, action, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText, generateText, type ModelMessage } from "ai";
import { Id } from "./_generated/dataModel";

// --- Action to start a new thread with AI-generated title ---
export const startThread = action({
  args: {
    userId: v.string(),
    userMessage: v.string(),
    party: v.union(v.literal("liberal"), v.literal("conservative")),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    threadId: Id<"threads">;
    userMessageId: Id<"messages">;
    assistantMessageId: Id<"messages">;
  }> => {
    const venice = createOpenAICompatible({
      name: "venice",
      apiKey: process.env.VENICE_API_KEY,
      baseURL: "https://api.venice.ai/api/v1",
      includeUsage: true,
    });

    // Generate title using AI
    const titleResult = await generateText({
      model: venice("venice-uncensored"),
      messages: [
        {
          role: "system",
          content:
            "Generate a concise, descriptive title for this conversation based on the user's first message. Only respond with the title, nothing else.",
        },
        {
          role: "user",
          content: args.userMessage,
        },
      ],
      maxOutputTokens: 10,
    });

    const generatedTitle = titleResult.text.trim();

    // 1. Create new thread with generated title
    const threadId = await ctx.runMutation(api.messages.createThread, {
      title: generatedTitle,
      userId: args.userId,
    });

    // 2. Insert user message
    const userMessageId = await ctx.runMutation(api.messages.insertUserMessage, {
      threadId,
      userMessage: args.userMessage,
      party: args.party,
    });

    // 3. Insert assistant placeholder
    const assistantMessageId = await ctx.runMutation(api.messages.insertAssistantPlaceholder, {
      threadId,
      party: args.party,
    });

    return { threadId, userMessageId, assistantMessageId };
  },
});

// --- Helper mutations (these need to be added to support the refactored startThread) ---
export const createThread = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"threads">> => {
    return await ctx.db.insert("threads", {
      title: args.title,
      userId: args.userId,
      archived: false,
    });
  },
});

export const insertUserMessage = mutation({
  args: {
    threadId: v.id("threads"),
    userMessage: v.string(),
    party: v.union(v.literal("liberal"), v.literal("conservative")),
  },
  handler: async (ctx, args): Promise<Id<"messages">> => {
    return await ctx.db.insert("messages", {
      threadId: args.threadId,
      role: "user",
      party: args.party,
      text: args.userMessage,
      status: "done",
    });
  },
});

export const insertAssistantPlaceholder = mutation({
  args: {
    threadId: v.id("threads"),
    party: v.union(v.literal("liberal"), v.literal("conservative")),
  },
  handler: async (ctx, args): Promise<Id<"messages">> => {
    return await ctx.db.insert("messages", {
      threadId: args.threadId,
      role: "assistant",
      party: args.party,
      text: "",
      status: "pending",
    });
  },
});

// --- Mutation to add a new message to an existing thread ---
export const addMessageToThread = mutation({
  args: {
    threadId: v.id("threads"),
    userMessage: v.string(),
    party: v.union(v.literal("liberal"), v.literal("conservative")),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ userMessageId: Id<"messages">; assistantMessageId: Id<"messages"> }> => {
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

// --- Stream assistant reply with full conversation context ---
const MAX_CONVERSATION_HISTORY = 20;
const DEFAULT_TEMPERATURE = 0.9;
const CHUNK_BATCH_SIZE = 5;

export const streamAssistant = action({
  args: {
    messageId: v.id("messages"),
    threadId: v.id("threads"),
    temperature: v.optional(v.number()), // Allow customizable temperature
    maxTokens: v.optional(v.number()), // Allow token limit control
  },
  handler: async (ctx, args): Promise<void> => {
    try {
      // Validate environment
      if (!process.env.VENICE_API_KEY) {
        throw new Error("VENICE_API_KEY environment variable is not set");
      }

      // Initialize Venice client
      const venice = createOpenAICompatible({
        name: "venice",
        apiKey: process.env.VENICE_API_KEY,
        baseURL: "https://api.venice.ai/api/v1",
        includeUsage: true,
      });

      // Mark assistant message as "streaming" early
      await ctx.runMutation(api.messages.updateMessageStatus, {
        messageId: args.messageId,
        status: "streaming",
      });

      // Get conversation history with error handling
      const messages = await ctx.runQuery(api.messages.getMessages, {
        threadId: args.threadId,
      });

      if (!messages || messages.length === 0) {
        throw new Error("No messages found in thread");
      }

      // Build conversation history more efficiently
      const conversationHistory = buildConversationHistory(messages, args.messageId);

      if (conversationHistory.length === 0) {
        throw new Error("No valid conversation history found");
      }

      // Prepare streaming options
      const streamOptions = {
        model: venice("venice-uncensored"),
        messages: conversationHistory,
        temperature: args.temperature ?? DEFAULT_TEMPERATURE,
        ...(args.maxTokens && { maxTokens: args.maxTokens }),
      };

      // Call Venice model with full conversation context
      const result = streamText(streamOptions);

      // Process stream with batching and better error handling
      await processStream(ctx, result, args.messageId);
    } catch (error) {
      console.error("Error in streamAssistant:", error);

      // Mark message as failed and update with error info
      await ctx.runMutation(api.messages.updateMessageStatus, {
        messageId: args.messageId,
        status: "error",
      });

      // Optionally append error message for user visibility
      const errorMessage =
        error instanceof Error ? `Error: ${error.message}` : "An unexpected error occurred";

      await ctx.runMutation(api.messages.appendChunk, {
        messageId: args.messageId,
        content: errorMessage,
        index: 0,
      });

      throw error; // Re-throw to maintain error propagation
    }
  },
});

/**
 * Build conversation history from messages, removing duplicates and filtering appropriately
 */
function buildConversationHistory(
  messages: Array<{ _id: string; text: string; role: string; status: string }>,
  currentMessageId: string
): ModelMessage[] {
  const seen = new Set<string>();

  return messages
    .filter((msg) => {
      // Filter out current message and incomplete messages
      if (msg._id === currentMessageId || msg.status !== "done") {
        return false;
      }

      // Filter out duplicates (but allow empty messages through first)
      if (msg.text && seen.has(msg.text)) {
        return false;
      }

      if (msg.text) {
        seen.add(msg.text);
      }

      return true;
    })
    .slice(-MAX_CONVERSATION_HISTORY) // Get most recent messages
    .map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.text || "", // Handle potential null/undefined text
    }))
    .filter((msg) => msg.content.trim().length > 0); // Remove empty messages
}

/**
 * Process the stream with batching and proper error handling
 */
async function processStream(ctx: any, result: any, messageId: string): Promise<void> {
  let index = 0;
  let buffer = "";
  let chunkBatch: Array<{ content: string; index: number }> = [];

  try {
    for await (const delta of result.textStream) {
      buffer += delta;

      // Add to batch
      chunkBatch.push({
        content: delta,
        index,
      });

      // Process batch when it reaches the batch size
      if (chunkBatch.length >= CHUNK_BATCH_SIZE) {
        await flushChunkBatch(ctx, messageId, chunkBatch);
        chunkBatch = [];
      }

      index++;
    }

    // Flush remaining chunks
    if (chunkBatch.length > 0) {
      await flushChunkBatch(ctx, messageId, chunkBatch);
    }

    // Finalize message
    await ctx.runMutation(api.messages.finalizeMessage, {
      messageId,
      text: buffer,
    });
  } catch (error) {
    console.error("Error processing stream:", error);
    throw error;
  }
}

/**
 * Flush a batch of chunks to the database
 */

export const appendChunkBatch = mutation({
  args: {
    messageId: v.id("messages"),
    chunks: v.array(
      v.object({
        content: v.string(),
        index: v.number(),
      })
    ),
  },
  handler: async (ctx, args): Promise<void> => {
    // Insert all chunks in a single transaction, maintaining order
    const insertPromises = args.chunks.map((chunk) =>
      ctx.db.insert("messageChunks", {
        messageId: args.messageId,
        content: chunk.content,
        index: chunk.index,
      })
    );

    await Promise.all(insertPromises);
  },
});

async function flushChunkBatch(
  ctx: any,
  messageId: string,
  chunks: Array<{ content: string; index: number }>
): Promise<void> {
  await ctx.runMutation(api.messages.appendChunkBatch, {
    messageId,
    chunks,
  });
}

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
  handler: async (ctx, { messageId, status }): Promise<void> => {
    await ctx.db.patch(messageId, { status });
  },
});

export const appendChunk = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    index: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"messageChunks">> => {
    return await ctx.db.insert("messageChunks", {
      messageId: args.messageId,
      content: args.content,
      index: args.index,
    });
  },
});

export const finalizeMessage = mutation({
  args: { messageId: v.id("messages"), text: v.string() },
  handler: async (ctx, args): Promise<void> => {
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
