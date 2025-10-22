import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { agent } from "./agent";
import { api, components } from "./_generated/api";
import { rag } from "./rag";
import { listUIMessages, listMessages } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";

export const insertMessage = mutation({
  args: { threadId: v.string(), messageId: v.string(), bias: v.string() },
  handler: async (ctx, { threadId, messageId, bias }) => {
    await ctx.db.insert("message_bias", {
      threadId,
      messageId,
      bias,
    });
  },
});

export const updateComparisonResponse = mutation({
  args: { messageId: v.string(), comparisonResponse: v.string() },
  handler: async (ctx, { messageId, comparisonResponse }) => {
    const message = await ctx.db
      .query("message_bias")
      .filter((q) => q.eq(q.field("messageId"), messageId))
      .unique();
    if (message) {
      await ctx.db.patch(message._id, { comparisonResponse });
    }
  },
});

export const getThreadMessagesBias = query({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("message_bias")
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .collect();

    return messages;
  },
});

export const getMessageBias = query({
  args: { messageId: v.string() },
  handler: async (ctx, args) => {
    const message = await ctx.db
      .query("message_bias")
      .filter((q) => q.eq(q.field("messageId"), args.messageId))
      .unique();

    return message;
  },
});

export const findUserPrompt = query({
  args: { messageId: v.string(), threadId: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const messages = await listMessages(ctx, components.agent, args);

    const messageOrder = messages.page.find((m) => m._id === args.messageId)?.order;
    const userPrompt = messages.page.find(
      (m) => m.order === messageOrder && m.stepOrder === 0
    )?.text;

    return { userPrompt };
  },
});

export const generateComparisonResponse = action({
  args: { threadId: v.string(), messageId: v.string(), messageText: v.string() },
  handler: async (ctx, args) => {
    const messageBias = await ctx.runQuery(api.messages.getMessageBias, {
      messageId: args.messageId,
    });

    if (!messageBias) return;
    const bias = messageBias?.bias;
    const oppositeBias = bias === "liberal" ? "conservative" : "liberal";

    const { userPrompt } = await ctx.runQuery(api.messages.findUserPrompt, {
      messageId: args.messageId,
      threadId: args.threadId,
      paginationOpts: { cursor: null, numItems: 1000000 },
    });

    if (!userPrompt) return;

    let contextMessages: any[] = [];

    const searchResults = await rag.search(ctx, {
      namespace: bias === "conservative" ? "hasanabi" : "nickjfuentes",
      query: userPrompt,
      limit: 5,
      vectorScoreThreshold: 0.5,
    });

    if (searchResults && searchResults.entries.length > 0) {
      contextMessages = searchResults.entries
        .map((entry) => ({ role: "system", content: entry.text }))
        .filter((msg) => !!msg.content);

      console.log("contextMessages", contextMessages);
    }

    const result = await agent.generateText(
      ctx,
      { threadId: args.threadId },
      {
        messages: [...contextMessages, { role: "user", content: userPrompt }],
      },
      { storageOptions: { saveMessages: "none" } }
    );

    await ctx.runMutation(api.messages.updateComparisonResponse, {
      messageId: messageBias.messageId,
      comparisonResponse: result ? result.text : "Something went wrong.",
    });
  },
});
