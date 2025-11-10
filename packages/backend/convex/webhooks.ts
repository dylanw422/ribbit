import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { api } from "./_generated/api";

export const createSubscription = internalMutation({
  args: {
    userId: v.string(),
    dodoId: v.string(),
    subscriptionId: v.string(),
    customerEmail: v.string(),
    status: v.string(),
    webhookPayload: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("subscriptions", {
      userId: args.userId,
      dodoId: args.dodoId,
      subscriptionId: args.subscriptionId,
      customerEmail: args.customerEmail,
      status: args.status,
      webhookPayload: args.webhookPayload,
    });
  },
});

export const cancelSubscription = internalMutation({
  args: {
    dodoId: v.string(),
  },
  handler: async (ctx, args) => {
    const subs = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("dodoId"), args.dodoId))
      .unique();

    if (!subs) return;
    const updatedSub = await ctx.db.patch(subs._id, {
      status: "cancelled",
    });
  },
});
