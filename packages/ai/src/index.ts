import { ChatOllama } from "@langchain/ollama";
import type { Event } from "@console-ai/domain";
import { getPrompt } from "./prompts.js";
import { ChatOpenRouter } from "@langchain/openrouter";

export class Ai {
  private llm: ChatOllama | ChatOpenRouter | null = null;

  constructor(
    config?: {
      model?: string;
      temperature?: number;
      baseUrl?: string;
    },
    useOllama: boolean = false,
    openRouterApiKey?: string,
  ) {
    if (useOllama) {
      const ollamaConfig = {
        model: config?.model || "llama3.2",
        temperature: config?.temperature || 0.4,
        baseUrl: config?.baseUrl || "http://localhost:11434",
      };
      console.log("[AI] Initializing with Ollama:", ollamaConfig);
      this.llm = new ChatOllama(ollamaConfig);
    } else {
      if (!openRouterApiKey) {
        throw new Error(
          "OpenRouter API key is required when useOllama is false",
        );
      }

      const openRouterConfig = {
        model: "nvidia/nemotron-3-super-120b-a12b:free",
        temperature: 0.4,
        maxTokens: 1024,
        apiKey: openRouterApiKey ? `${openRouterApiKey.substring(0, 10)}...` : "MISSING",
      };
      console.log("[AI] Initializing with OpenRouter:", openRouterConfig);
      this.llm = new ChatOpenRouter({
        model: "nvidia/nemotron-3-super-120b-a12b:free",
        temperature: 0.4,
        maxTokens: 1024,
        apiKey: openRouterApiKey,
      });
    }
  }

  async generateExplanation(event: Event): Promise<string> {
    if (!this.llm) {
      throw new Error(
        "LLM not initialized. Please call loadLlm() before generating explanations.",
      );
    }

    try {
      console.log("[AI] Event data received:", JSON.stringify(event, null, 2));
      const prompt = getPrompt(event);
      console.log("[AI] Prompt to send to LLM:", prompt);

      const response = await this.llm.invoke(prompt);
      console.log("[AI] Response from LLM:", response.content);
      return response.content as string;
    } catch (error) {
      console.error("Error generating explanation:", error);
      throw new Error(
        `Failed to generate explanation: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
