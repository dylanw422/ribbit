import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const updateBias = mutation({
  args: { messageId: v.string(), bias: v.string() },
  handler: async (ctx, { messageId, bias }) => {
    const message = await ctx.db
      .query("message_bias")
      .filter((q) => q.eq(q.field("messageId"), messageId))
      .unique();
    if (message) {
      await ctx.db.patch(message._id, { bias });
    }
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
