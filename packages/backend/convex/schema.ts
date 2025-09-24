import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),

  threads: defineTable({
    title: v.string(),
    userId: v.string(),
    archived: v.boolean(),
  }).index("by_user", ["userId"]),

  messages: defineTable({
    threadId: v.id("threads"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    text: v.string(), // final message text
    party: v.union(v.literal("liberal"), v.literal("conservative")),
    status: v.union(
      v.literal("pending"),
      v.literal("streaming"),
      v.literal("done"),
      v.literal("error")
    ),
  }).index("by_thread", ["threadId"]),

  messageChunks: defineTable({
    messageId: v.id("messages"), // link to parent message
    content: v.string(), // partial token or text chunk
    index: v.number(), // ordering for reconstruction
  }).index("by_message", ["messageId"]),
});
