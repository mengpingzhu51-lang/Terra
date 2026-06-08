import { ChatOpenAI } from "@langchain/openai";

// OpenRouter 使用 OpenAI 兼容接口，需要把 OPENROUTER_API_KEY 映射到 OPENAI_API_KEY
if (process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = process.env.OPENROUTER_API_KEY;
}

export function createOpenRouterModel() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("WARNING: OPENROUTER_API_KEY environment variable is not defined.");
  }

  return new ChatOpenAI({
    modelName: process.env.LANGGRAPH_LLM_MODEL ?? "moonshotai/kimi-k2",
    temperature: 0,
    openAIApiKey: process.env.OPENROUTER_API_KEY || "MOCK_KEY",
    configuration: {
      baseURL: process.env.LANGGRAPH_LLM_BASE_URL ?? "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.APP_URL ?? "https://terra-ashy.vercel.app",
        "X-Title": "Terra Resume Platform",
      },
    },
  });
}
