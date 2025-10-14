import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { agent, debateAgent } from "./agent";
import { api } from "./_generated/api";

export const setHeated = mutation({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const heatedId = await ctx.db.insert("heated", { threadId: args.threadId, debateSubject: "" });
  },
});

export const isHeated = query({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const heated = await ctx.db
      .query("heated")
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .collect();

    return heated.length > 0;
  },
});

export const allHeated = query({
  handler: async (ctx) => {
    const heated = await ctx.db.query("heated").collect();
    return heated;
  },
});

export const updateDebateSubject = mutation({
  args: { threadId: v.string(), debateSubject: v.string() },
  handler: async (ctx, { threadId, debateSubject }) => {
    const heatedId = await ctx.db
      .query("heated")
      .filter((q) => q.eq(q.field("threadId"), threadId))
      .unique();
    if (heatedId) {
      await ctx.db.patch(heatedId._id, { debateSubject });
    }
  },
});

export const generateDebateSubject = action({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    const result = await agent.generateText(
      ctx,
      { threadId },
      {
        prompt:
          "Generate a concise, description of this debate topic. Only respond with the title, nothing else. 5-10 words.",
        maxOutputTokens: 15,
      },
      { storageOptions: { saveMessages: "none" } }
    );

    await ctx.runMutation(api.heated.updateDebateSubject, {
      threadId,
      debateSubject: result.text,
    });
  },
});
