import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  heated: defineTable({
    threadId: v.string(),
    debateSubject: v.string(),
  }),
  message_bias: defineTable({
    threadId: v.string(),
    messageId: v.string(),
    bias: v.string(),
    comparisonResponse: v.optional(v.string()),
  }),
  political_messages: defineTable({
    threadId: v.string(),
    messageId: v.string(),
  }),
  subscriptions: defineTable({
    userId: v.string(),
    dodoId: v.string(),
    subscriptionId: v.string(),
    customerEmail: v.string(),
    status: v.string(),
    webhookPayload: v.string(),
  }),
});
