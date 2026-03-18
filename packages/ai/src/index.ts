import { ChatOllama } from '@langchain/ollama'
import type { Event } from '@console-ai/domain'
import { getPrompt } from './prompts.js';


export class Ai {
    private llm: ChatOllama;

    constructor(config?: {
        model?: string;
        temperature?: number;
        baseUrl?: string;
    }) {
        this.llm = new ChatOllama({
            model: config?.model || 'llama3.2',
            temperature: config?.temperature || 0.4,
            baseUrl: config?.baseUrl || 'http://localhost:11434',
        });
    }

    
    async generateExplanation(event: Event): Promise<string> {
        try {
            const prompt = getPrompt(event);
            const response = await this.llm.invoke(prompt);
            return response.content as string;
        } catch (error) {
            console.error('Error generating explanation:', error);
            throw new Error(`Failed to generate explanation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

}

