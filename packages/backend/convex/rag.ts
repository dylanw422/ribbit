import { components } from "./_generated/api";
import { RAG } from "@convex-dev/rag";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const venice = createOpenAICompatible({
  name: "venice",
  apiKey: process.env.VENICE_API_KEY,
  baseURL: "https://api.venice.ai/api/v1",
  includeUsage: true,
});

export const rag = new RAG(components.rag, {
  textEmbeddingModel: venice.textEmbeddingModel("text-embedding-bge-m3"),
  embeddingDimension: 1024,
});
