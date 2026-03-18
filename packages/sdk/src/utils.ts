/**
 * Utility functions for the Console AI SDK
 */

/**
 * Extract source file from stack trace
 */
export function extractSourceFromStack(stack: string): string | undefined {
  // Match patterns like "at function (file.ts:10:5)"
  const match = stack.match(/at .+ \((.+?):(\d+):(\d+)\)/);
  if (match) {
    return match[1];
  }
  
  // Match patterns like "at file.ts:10:5"
  const simpleMatch = stack.match(/at (.+?):(\d+):(\d+)/);
  if (simpleMatch) {
    return simpleMatch[1];
  }
  
  return undefined;
}

/**
 * Extract line and column from stack trace
 */
export function extractLocationFromStack(stack: string): { line?: number; column?: number } {
  const match = stack.match(/:(\d+):(\d+)/);
  if (match) {
    return {
      line: parseInt(match[1], 10),
      column: parseInt(match[2], 10),
    };
  }
  return {};
}

/**
 * Get code context around an error (if available)
 */
export function getCodeContext(
  source: string,
  line: number,
  contextLines: number = 3
): string | undefined {
  try {
    // This would need file system access in Node.js
    // For now, return undefined
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Detect programming language from file extension
 */
export function detectLanguageFromFile(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'go': 'go',
    'rs': 'rust',
    'rb': 'ruby',
    'php': 'php',
    'cs': 'csharp',
    'cpp': 'cpp',
    'c': 'c',
    'swift': 'swift',
    'kt': 'kotlin',
  };
  
  return languageMap[ext || ''] || 'unknown';
}

/**
 * Sanitize error message (remove sensitive data)
 */
export function sanitizeErrorMessage(message: string): string {
  // Remove potential API keys, tokens, passwords
  return message
    .replace(/api[_-]?key[=:]\s*['"]?[\w-]+['"]?/gi, 'api_key=***')
    .replace(/token[=:]\s*['"]?[\w.-]+['"]?/gi, 'token=***')
    .replace(/password[=:]\s*['"]?[^'"]+['"]?/gi, 'password=***')
    .replace(/bearer\s+[\w.-]+/gi, 'bearer ***');
}

/**
 * Sanitize stack trace (remove sensitive paths)
 */
export function sanitizeStackTrace(stack: string): string {
  // Remove absolute paths, keep relative paths
  return stack
    .replace(/\/Users\/[^/]+/g, '/Users/***')
    .replace(/\/home\/[^/]+/g, '/home/***')
    .replace(/C:\\Users\\[^\\]+/g, 'C:\\Users\\***');
}

/**
 * Get memory usage (Node.js only)
 */
export function getMemoryUsage(): number | undefined {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    return Math.round(usage.heapUsed / 1024 / 1024); // MB
  }
  return undefined;
}

/**
 * Get browser context (browser only)
 */
export function getBrowserContext(): {
  userAgent?: string;
  url?: string;
  viewport?: { width: number; height: number };
} {
  if (typeof window === 'undefined') {
    return {};
  }
  
  return {
    userAgent: navigator.userAgent,
    url: window.location.href,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  };
}

/**
 * Categorize error based on message
 */
export function categorizeError(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
    return 'network';
  }
  if (lowerMessage.includes('database') || lowerMessage.includes('sql') || lowerMessage.includes('query')) {
    return 'database';
  }
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return 'validation';
  }
  if (lowerMessage.includes('auth') || lowerMessage.includes('unauthorized') || lowerMessage.includes('forbidden')) {
    return 'authentication';
  }
  if (lowerMessage.includes('timeout')) {
    return 'timeout';
  }
  if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
    return 'not_found';
  }
  
  return 'unknown';
}

/**
 * Format error for logging
 */
export function formatErrorForLog(error: Error): string {
  return `${error.name}: ${error.message}\n${error.stack || 'No stack trace'}`;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('timeout') ||
    message.includes('network') ||
    message.includes('econnrefused') ||
    message.includes('enotfound') ||
    message.includes('503') ||
    message.includes('502')
  );
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function for rate limiting error submissions
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Made with Bob
