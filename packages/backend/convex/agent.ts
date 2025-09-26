import { components } from "./_generated/api";
import { Agent } from "@convex-dev/agent";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const venice = createOpenAICompatible({
  name: "venice",
  apiKey: process.env.VENICE_API_KEY,
  baseURL: "https://api.venice.ai/api/v1",
  includeUsage: true,
});

export const agent = new Agent(components.agent, {
  name: "venice",
  languageModel: venice.languageModel("venice-uncensored"),
  instructions: "You're a helpful assistant.",
  callSettings: {
    temperature: 0.85,
  },
});
