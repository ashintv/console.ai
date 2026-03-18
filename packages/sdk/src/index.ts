import type { CreateEventInput } from '@console-ai/domain';

/**
 * Console AI Configuration
 */
export interface ConsoleAIConfig {
  /** API key for authentication */
  apiKey: string;
  /** Base URL of the Console AI API (default: http://localhost:3000) */
  baseUrl?: string;
  /** Mode: 'log' (print to console) or 'trace' (save to database) */
  mode?: 'log' | 'trace';
  /** Programming language (auto-detected if not provided) */
  language?: string;
  /** Framework name (e.g., 'React', 'Express') */
  framework?: string;
}

/**
 * Console AI - AI-powered error logging
 * 
 * Drop-in replacement for console.error with AI explanations
 * 
 * @example
 * ```typescript
 * import { ConsoleAI } from '@console-ai/sdk';
 * 
 * const consoleAI = new ConsoleAI({
 *   apiKey: 'your-api-key',
 *   mode: 'log' // or 'trace' for production
 * });
 * 
 * // Use like console.error
 * consoleAI.error(new Error('Something went wrong'));
 * ```
 */
export class ConsoleAI {
  private apiKey: string;
  private baseUrl: string;
  private mode: 'log' | 'trace';
  private language: string;
  private framework?: string;

  constructor(config: ConsoleAIConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'http://localhost:3000';
    this.mode = config.mode || 'log';
    this.language = config.language || this.detectLanguage();
    this.framework = config.framework;

    if (!this.apiKey) {
      throw new Error('API key is required');
    }
  }

  /**
   * Log an error with AI explanation
   * 
   * Works like console.error but with AI-powered insights
   */
  async error(...args: any[]): Promise<void> {
    // Extract error information
    const error = args[0];
    let message: string;
    let stack: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
    } else {
      message = String(error);
    }

    // Extract source from stack if available
    const source = stack ? this.extractSource(stack) : undefined;

    // Prepare payload
    const payload: CreateEventInput = {
      message,
      stack,
      source,
      language: this.language,
      framework: this.framework,
    };

    try {
      // Send to API
      const response = await fetch(`${this.baseUrl}/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      // Mode: log - Print error + AI explanation to console
      if (this.mode === 'log') {
        console.error('\n❌ Error:', message);
        if (stack) {
          console.error('\n📍 Stack Trace:');
          console.error(stack);
        }
        if (result.event.aiAnalysis) {
          console.error('\n🤖 AI Explanation:');
          console.error(result.event.aiAnalysis);
        }
        console.error('\n' + '─'.repeat(80) + '\n');
      }
      
      // Mode: trace - Just save to database (silent)
      // In trace mode, errors are saved but not printed
      // Users can view them in the dashboard

    } catch (apiError) {
      // Fallback to regular console.error if API fails
      console.error('ConsoleAI API Error:', apiError);
      console.error('Original error:', ...args);
    }
  }

  /**
   * Log a warning (alias for error with lower severity)
   */
  async warn(...args: any[]): Promise<void> {
    return this.error(...args);
  }

  /**
   * Extract source file from stack trace
   */
  private extractSource(stack: string): string | undefined {
    const match = stack.match(/at .+ \((.+?):(\d+):(\d+)\)/) || 
                  stack.match(/at (.+?):(\d+):(\d+)/);
    return match ? match[1] : undefined;
  }

  /**
   * Detect programming language
   */
  private detectLanguage(): string {
    if (typeof window !== 'undefined') {
      return 'javascript';
    }
    if (typeof process !== 'undefined') {
      return 'javascript';
    }
    return 'javascript';
  }
}

/**
 * Create a Console AI instance
 */
export function createConsoleAI(config: ConsoleAIConfig): ConsoleAI {
  return new ConsoleAI(config);
}

// Export types
export type { CreateEventInput } from '@console-ai/domain';

// Made with Bob
