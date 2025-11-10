import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { api } from "./_generated/api";

export const createSubscription = mutation({
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
