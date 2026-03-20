import type { CreateEventInput } from '@console-ai/domain';
import chalk from 'chalk';

/**
 * Clean markdown formatting from AI message for console output with proper spacing and styling
 */
function cleanMarkdown(text: string): string {
  // Store code blocks with placeholders
  const codeBlocks: string[] = [];
  let codeBlockIndex = 0;

  // Extract and style code blocks
  text = text.replace(/```[\s\S]*?```/g, (match) => {
    const code = match.replace(/```\w*\n?/g, '').trim();
    const styledCode = createCodeBox(code);
    const placeholder = `__CODE_BLOCK_${codeBlockIndex}__`;
    codeBlocks.push(styledCode);
    codeBlockIndex++;
    return '\n' + placeholder + '\n';
  });

  // Process section headers (##) - Add visual separation with emojis
  text = text.replace(/^##\s+(.+)$/gm, (match, headerText) => {
    const icons: Record<string, string> = {
      'Current Code': '📍',
      'Reasons': '🔍',
      'Fixes': '✅',
      'Updated Code': '💻',
    };
    const icon = Object.entries(icons).find(([key]) => headerText.includes(key))?.[1] || '→';
    return '\n' + chalk.bold.cyan(`${icon} ${headerText.trim()}`) + '\n';
  });

  // Process inline code with color
  text = text.replace(/`([^`]+)`/g, (match, code) => chalk.cyan(code));

  // Remove bold but keep text
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');

  // Remove italic but keep text
  text = text.replace(/\*([^*]+)\*/g, '$1');

  // Convert headers to uppercase with spacing
  text = text.replace(/^#{1,6}\s+(.+)$/gm, (match, headerText) =>
    '\n' + chalk.bold.yellow(headerText.toUpperCase()) + '\n'
  );

  // Remove links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Convert list markers to bullets with proper indentation
  text = text.replace(/^\s*[-*+]\s+/gm, '  • ');

  // Convert numbered lists to bullets with proper indentation
  text = text.replace(/^\s*\d+\.\s+/gm, '  • ');

  // Clean up multiple blank lines
  text = text.replace(/\n{3,}/g, '\n\n');

  // Restore code blocks
  codeBlocks.forEach((styledCode, index) => {
    text = text.replace(`__CODE_BLOCK_${index}__`, styledCode);
  });

  // Add proper spacing around paragraphs
  return text
    .split('\n\n')
    .map(para => para.trim())
    .filter(para => para.length > 0)
    .join('\n\n')
    .trim();
}

/**
 * Create a styled box around code
 */
function createCodeBox(code: string): string {
  const lines = code.split('\n');
  const maxLength = Math.max(...lines.map(line => line.length));
  const width = Math.min(maxLength + 4, 76); // Max 76 chars wide
  
  const topBorder = chalk.gray('┌' + '─'.repeat(width) + '┐');
  const bottomBorder = chalk.gray('└' + '─'.repeat(width) + '┘');
  
  const styledLines = lines.map(line => {
    const paddedLine = line.padEnd(width - 2);
    return chalk.gray('│ ') + chalk.cyan(paddedLine) + chalk.gray(' │');
  });
  
  return [topBorder, ...styledLines, bottomBorder].join('\n');
}



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
    const functionName = stack ? this.extractFunction(stack) : undefined;
    const functionContext = stack ? await this.extractFunctionCode(stack) : undefined;

    // Prepare payload
    const payload: CreateEventInput = {
      message,
      stack,
      source,
      language: this.language,
      framework: this.framework,
      functionName,
      functionContext,
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
        console.error('\n' + '═'.repeat(80));
        console.error(chalk.bold.red('❌ ERROR DETECTED'));
        console.error('═'.repeat(80));

        console.error('\n' + chalk.bold('Message:'), message);

        if (functionName) {
          console.error(chalk.bold('\n📍 Function:'), functionName);
        }
        if (functionContext) {
          console.error('\n' + chalk.bold('📄 Code Context:'));
          console.error(functionContext);
        }
        if (source) {
          console.error(chalk.bold('\n📁 Source:'), source);
        }

        if (result.event.aiAnalysis) {
          console.error('\n' + '═'.repeat(80));
          console.error(chalk.bold.cyan('🤖 AI Analysis:'));
          console.error('═'.repeat(80) + '\n');
          console.error(cleanMarkdown(result.event.aiAnalysis));
        }
        console.error('\n' + '═'.repeat(80) + '\n');
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
   * Extract function name from stack trace
   */
  private extractFunction(stack: string): string | undefined {
    // Match function name from stack trace
    // Patterns: "at functionName (file:line:col)" or "at functionName"
    const match = stack.match(/at\s+([^\s(]+)/);
    return match ? match[1] : undefined;
  }

  /**
   * Detect if running in Node.js environment
   */
  private isNodeEnvironment(): boolean {
    // Check for Node.js process object
    if (typeof process !== 'undefined' && process.versions?.node) {
      console.log('[SDK] Environment: Node.js');
      return true;
    }
    console.log('[SDK] Environment: Browser');
    return false;
  }

  /**
   * Extract function code context from stack trace (source code lines)
   */
  private async extractFunctionCode(stack: string): Promise<string | undefined> {
    try {
      // Match file and line number
      const match = stack.match(/at\s+\S+\s+\((.+?):(\d+):/);
      if (!match) {
        console.log('[SDK] No file path found in stack trace');
        return undefined;
      }

      const [, filePath, lineNum] = match;
      const lineNumber = parseInt(lineNum);
      console.log(`[SDK] Extracting code context from: ${filePath}:${lineNumber}`);

      // Try to read source file in Node.js
      if (this.isNodeEnvironment()) {
        try {
          const { readFileSync, existsSync } = await import('fs');
          if (existsSync(filePath)) {
            const source = readFileSync(filePath, 'utf-8');
            const lines = source.split('\n');

            // Extract surrounding lines for context (3 before, 3 after error line)
            const contextStart = Math.max(0, lineNumber - 4);
            const contextEnd = Math.min(lines.length, lineNumber + 3);
            const context = lines
              .slice(contextStart, contextEnd)
              .map((line, idx) => {
                const lineNum = contextStart + idx + 1;
                const marker = lineNum === lineNumber ? '> ' : '  ';
                return `${marker}${lineNum.toString().padEnd(4)} | ${line}`;
              })
              .join('\n');

            console.log('[SDK] Function code context extracted successfully');
            return context;
          } else {
            console.log(`[SDK] File not found: ${filePath}`);
          }
        } catch (e) {
          console.log(`[SDK] Failed to read file: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
      }
    } catch (e) {
      console.log(`[SDK] Error extracting function code: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }

    return undefined;
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
