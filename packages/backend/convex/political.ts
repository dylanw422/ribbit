import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const threadsPoliticalMessages = query({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("political_messages")
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .collect();

    return messages;
  },
});

export const insertMessage = mutation({
  args: { threadId: v.string(), messageId: v.string() },
  handler: async (ctx, { threadId, messageId }) => {
    await ctx.db.insert("political_messages", {
      threadId,
      messageId,
    });
  },
});
