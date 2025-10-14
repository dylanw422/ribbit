import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  heated: defineTable({
    threadId: v.string(),
    debateSubject: v.string(),
  }),
  message_bias: defineTable({
    messageId: v.string(),
    bias: v.string(),
    comparisonResponse: v.string(),
  }),
});
