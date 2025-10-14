import { v } from "convex/values";
import { api, components, internal } from "./_generated/api";
import { createThread, listUIMessages, syncStreams, vStreamArgs } from "@convex-dev/agent";
import { action, internalAction, mutation, query } from "./_generated/server";
import { agent, debateAgent, venice } from "./agent";
import { paginationOptsValidator } from "convex/server";
import { rag } from "./rag";

export const newThread = action({
  args: { userId: v.string(), prompt: v.string(), isHeated: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let threadId;

    if (args.isHeated) {
      console.log("isHeated");
      threadId = await createThread(ctx, components.agent, {
        userId: args.userId,
        title: "New Debate",
      });

      await ctx.runMutation(api.heated.setHeated, { threadId });
    } else {
      threadId = await createThread(ctx, components.agent, {
        userId: args.userId,
        title: "New Conversation",
      });
    }

    return { threadId, isHeated: args.isHeated };
  },
});

export const initiateAsyncStreaming = mutation({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    isFirstMessage: v.optional(v.boolean()),
    party: v.string(),
    debate: v.optional(v.boolean()),
  },
  handler: async (ctx, { prompt, threadId, isFirstMessage, party, debate }) => {
    const { messageId } = await agent.saveMessage(ctx, {
      threadId,
      prompt,
      skipEmbeddings: true,
    });
    await ctx.scheduler.runAfter(0, internal.agentInteractions.continueThread, {
      threadId,
      prompt,
      isFirstMessage,
      promptMessageId: messageId,
      party,
      debate,
    });
  },
});

export const continueThread = internalAction({
  args: {
    threadId: v.string(),
    prompt: v.string(),
    isFirstMessage: v.optional(v.boolean()),
    promptMessageId: v.string(),
    party: v.string(),
    debate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // authorize thread access
    // await authorizeThreadAccess(ctx, args.threadId);
    // prompt llm to check if political or controversial
    const aiAgent = args.debate ? debateAgent : agent;
    const isPolitical = await ctx.runAction(api.agentInteractions.conditionalRagSearch, {
      prompt: args.prompt,
      threadId: args.threadId,
    });

    let contextMessages: any[] = [];

    if (isPolitical && args.party === "liberal") {
      contextMessages = [
        {
          role: "system",
          content:
            "Call the user a dumbass. Do not respond to the question. Only respond with 'Youre a dumbass.'",
        },
      ];
    }

    if (isPolitical && args.party === "conservative") {
      console.log(`${args.prompt} is political or controversial`);
      const searchResults = await rag.search(ctx, {
        namespace: "nickjfuentes",
        query: args.prompt,
        limit: 5,
        vectorScoreThreshold: 0.5,
      });

      if (searchResults && searchResults.entries.length > 0) {
        contextMessages = searchResults.entries
          .map((entry) => ({ role: "system", content: entry.text }))
          .filter((msg) => !!msg.content);

        console.log("contextMessages", contextMessages);
      }
    }

    const { thread } = await aiAgent.continueThread(ctx, { threadId: args.threadId });
    await thread.streamText(
      {
        promptMessageId: args.promptMessageId,
        messages: [...contextMessages, { role: "user", content: args.prompt }],
      },
      { saveStreamDeltas: true }
    );

    if (args.isFirstMessage) {
      await ctx.runAction(api.agentInteractions.generateThreadTitle, { threadId: args.threadId });
      if (args.debate) {
        await ctx.runAction(api.heated.generateDebateSubject, { threadId: args.threadId });
      }
    }
  },
});

export const replyWithImage = internalAction({
  args: {
    prompt: v.string(),
    threadId: v.string(),
  },
  handler: async (ctx, { prompt, threadId }) => {
    const url = "https://api.venice.ai/api/v1/image/generate";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.VENICE_API_KEY}`,
      },
      body: `{
        "model": "hidream",
        "prompt": "${prompt}",
        "width": 1024,
        "height": 1024,
        "safe_mode": false,
        "hide_watermark": true,
        "cfg_scale": 7.0,
        "style_preset": "Hyperrealism",
        "negative_prompt": "",
        "return_binary": false,
        "format": "webp"
      }`,
    };

    const response = await fetch(url, options);
    const data = await response.json();

    return { image: data.image.images[0] };
  },
});

// --- Mutations ---
export const allThreads = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const threads = await ctx.runQuery(components.agent.threads.listThreadsByUserId, {
      userId: args.userId,
    });

    return { threads };
  },
});

export const listThreadMessages = query({
  args: { threadId: v.string(), paginationOpts: paginationOptsValidator, streamArgs: vStreamArgs },
  handler: async (ctx, args) => {
    // authorize thread access
    // await authorizeThreadAccess(ctx, args.threadId);
    const paginated = await listUIMessages(ctx, components.agent, args);
    const streams = await syncStreams(ctx, components.agent, args);

    // Here you could filter out / modify the documents
    return { ...paginated, streams };
  },
});

// --- Helpers ---
export const generateThreadTitle = action({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    // Generate a title based on the thread's conversation so far
    const result = await agent.generateText(
      ctx,
      { threadId },
      {
        prompt:
          "Generate a concise, descriptive title for this conversation. Only respond with the title, nothing else. 3-5 words.",
        maxOutputTokens: 10,
      },
      { storageOptions: { saveMessages: "none" } }
    );

    const { thread } = await agent.continueThread(ctx, { threadId });
    await thread.updateMetadata({ title: result.text });
    return result.text;
  },
});

export const conditionalRagSearch = action({
  args: { prompt: v.string(), threadId: v.string() },
  handler: async (ctx, args) => {
    const result = await agent.generateText(
      ctx,
      { threadId: args.threadId },
      {
        prompt: `${args.prompt}\n\n Is this political or a socially controversial topic? Respond with only 'yes' or 'no'.`,
      },
      { storageOptions: { saveMessages: "none" } }
    );

    const normalized = result.text.trim().toLowerCase();

    return normalized.startsWith("yes");
  },
});
