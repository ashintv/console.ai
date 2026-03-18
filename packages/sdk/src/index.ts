import type { CreateEventInput } from '@console-ai/domain';

/**
 * Configuration options for the Console AI SDK
 */
export interface ConsoleAIConfig {
  /** API key for authentication */
  apiKey: string;
  /** Base URL of the Console AI API (default: http://localhost:3000) */
  baseUrl?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Automatically capture unhandled errors */
  autoCapture?: boolean;
  /** Programming language (auto-detected if not provided) */
  language?: string;
  /** Framework name (e.g., 'React', 'Express', 'Next.js') */
  framework?: string;
  /** Additional metadata to include with all errors */
  metadata?: Record<string, any>;
}

/**
 * Error data to be submitted
 */
export interface ErrorData {
  /** Error message */
  message: string;
  /** Stack trace */
  stack?: string;
  /** Source file where error occurred */
  source?: string;
  /** Programming language */
  language?: string;
  /** Framework name */
  framework?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Response from error submission
 */
export interface ErrorResponse {
  event: {
    id: string;
    message: string;
    stack?: string;
    source?: string;
    language: string;
    framework?: string;
    aiAnalysis?: string;
    metadata?: Record<string, any>;
    createdAt: string;
  };
}

/**
 * Console AI SDK Client
 * 
 * A lightweight client for tracking and analyzing errors with AI.
 * 
 * @example
 * ```typescript
 * import { ConsoleAI } from '@console-ai/sdk';
 * 
 * const client = new ConsoleAI({
 *   apiKey: 'your-api-key',
 *   language: 'typescript',
 *   framework: 'Express',
 *   autoCapture: true
 * });
 * 
 * // Manual error tracking
 * try {
 *   // your code
 * } catch (error) {
 *   await client.captureError(error);
 * }
 * ```
 */
export class ConsoleAI {
  private config: Required<ConsoleAIConfig>;
  private isInitialized: boolean = false;

  constructor(config: ConsoleAIConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'http://localhost:3000',
      debug: config.debug || false,
      autoCapture: config.autoCapture || false,
      language: config.language || this.detectLanguage(),
      framework: config.framework || '',
      metadata: config.metadata || {},
    };

    if (!this.config.apiKey) {
      throw new Error('API key is required');
    }

    if (this.config.autoCapture) {
      this.setupAutoCapture();
    }

    this.isInitialized = true;
    this.log('Console AI SDK initialized');
  }

  /**
   * Capture and submit an error
   */
  async captureError(error: Error | string, context?: Partial<ErrorData>): Promise<ErrorResponse> {
    const errorData = this.prepareErrorData(error, context);
    return this.submitError(errorData);
  }

  /**
   * Capture an exception with additional context
   */
  async captureException(error: Error, context?: {
    source?: string;
    metadata?: Record<string, any>;
  }): Promise<ErrorResponse> {
    return this.captureError(error, context);
  }

  /**
   * Capture a message as an error
   */
  async captureMessage(message: string, context?: Partial<ErrorData>): Promise<ErrorResponse> {
    return this.captureError(message, context);
  }

  /**
   * Submit error data directly
   */
  async submitError(errorData: ErrorData): Promise<ErrorResponse> {
    const payload: CreateEventInput = {
      message: errorData.message,
      stack: errorData.stack,
      source: errorData.source,
      language: errorData.language || this.config.language,
      framework: errorData.framework || this.config.framework,
      metadata: {
        ...this.config.metadata,
        ...errorData.metadata,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      },
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit error');
      }

      const result = await response.json();
      this.log('Error submitted successfully:', result.event.id);
      return result;
    } catch (error) {
      this.log('Failed to submit error:', error);
      throw error;
    }
  }

  /**
   * Wrap a function to automatically capture errors
   */
  wrap<T extends (...args: any[]) => any>(fn: T, context?: Partial<ErrorData>): T {
    const self = this;
    return (async function wrapped(...args: Parameters<T>) {
      try {
        return await fn(...args);
      } catch (error) {
        await self.captureError(error as Error, {
          ...context,
          source: context?.source || fn.name || 'anonymous',
        });
        throw error;
      }
    }) as T;
  }

  /**
   * Create a context-aware error capturer
   */
  withContext(context: Partial<ErrorData>) {
    return {
      captureError: (error: Error | string) => this.captureError(error, context),
      captureException: (error: Error) => this.captureException(error, context),
      captureMessage: (message: string) => this.captureMessage(message, context),
    };
  }

  /**
   * Prepare error data from various input types
   */
  private prepareErrorData(error: Error | string, context?: Partial<ErrorData>): ErrorData {
    let message: string;
    let stack: string | undefined;
    let source: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
      
      // Try to extract source file from stack trace
      if (stack && !context?.source) {
        const match = stack.match(/at .+ \((.+?):(\d+):(\d+)\)/);
        if (match) {
          source = match[1];
        }
      }
    } else {
      message = String(error);
    }

    return {
      message,
      stack: context?.stack || stack,
      source: context?.source || source,
      language: context?.language || this.config.language,
      framework: context?.framework || this.config.framework,
      metadata: context?.metadata,
    };
  }

  /**
   * Setup automatic error capture
   */
  private setupAutoCapture(): void {
    if (typeof window !== 'undefined') {
      // Browser environment
      window.addEventListener('error', (event) => {
        this.captureError(event.error || event.message, {
          source: event.filename,
          metadata: {
            line: event.lineno,
            column: event.colno,
          },
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(event.reason, {
          metadata: {
            type: 'unhandledRejection',
          },
        });
      });
    } else if (typeof process !== 'undefined') {
      // Node.js environment
      process.on('uncaughtException', (error) => {
        this.captureError(error).then(() => {
          // Allow time for error to be sent before exiting
          setTimeout(() => process.exit(1), 100);
        });
      });

      process.on('unhandledRejection', (reason) => {
        this.captureError(reason as Error, {
          metadata: {
            type: 'unhandledRejection',
          },
        });
      });
    }

    this.log('Auto-capture enabled');
  }

  /**
   * Detect programming language from environment
   */
  private detectLanguage(): string {
    if (typeof window !== 'undefined') {
      return 'javascript';
    }
    
    if (typeof process !== 'undefined') {
      // Check for TypeScript
      if (process.execPath.includes('tsx') || process.execPath.includes('ts-node')) {
        return 'typescript';
      }
      return 'javascript';
    }

    return 'unknown';
  }

  /**
   * Log debug messages
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[ConsoleAI]', ...args);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<ConsoleAIConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ConsoleAIConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };
    this.log('Configuration updated');
  }
}

/**
 * Create a Console AI client instance
 */
export function createClient(config: ConsoleAIConfig): ConsoleAI {
  return new ConsoleAI(config);
}

// Export utilities and integrations
export * from './types.js';
export * from './utils.js';
export * from './integrations.js';

// Export types
export type { CreateEventInput } from '@console-ai/domain';

// Made with Bob
