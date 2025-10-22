import { components, internal } from "./_generated/api";
import { RAG } from "@convex-dev/rag";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { action, mutation } from "./_generated/server";
import { v } from "convex/values";

const venice = createOpenAICompatible({
  name: "venice-embedding",
  apiKey: process.env.VENICE_API_KEY,
  baseURL: "https://api.venice.ai/api/v1",
});

export const rag = new RAG(components.rag, {
  textEmbeddingModel: venice.textEmbeddingModel("text-embedding-bge-m3"),
  embeddingDimension: 1024,
});

export const add = action({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    // Add the text to a namespace shared by all users.
    await rag.add(ctx, {
      namespace: "hasanabi",
      text,
    });
  },
});
