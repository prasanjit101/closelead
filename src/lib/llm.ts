import { env } from "@/env";
import { ChatCerebras } from "@langchain/cerebras";

export const MODEL = "llama-4-scout-17b-16e-instruct";

export const cerebrasLLM = new ChatCerebras({
  apiKey: env.CEREBRAS_API_KEY,
  model: MODEL,
  temperature: 0,
  maxRetries: 2,
});
