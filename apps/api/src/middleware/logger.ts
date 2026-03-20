import { Next } from 'hono';
import { AppContextType } from '../types';

export interface LoggerOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  includeResponseBody?: boolean;
  includeRequestBody?: boolean;
  onLog?: (log: RequestLog) => void;
}

export interface RequestLog {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  ip: string;
  userAgent: string;
  userId?: string;
  requestSize?: number;
  responseSize?: number;
  error?: string;
}

const LOG_COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function getStatusColor(status: number): string {
  if (status < 300) return LOG_COLORS.green;
  if (status < 400) return LOG_COLORS.cyan;
  if (status < 500) return LOG_COLORS.yellow;
  return LOG_COLORS.red;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function getClientIp(c: AppContextType): string {
  const forwarded = c.req.header('X-Forwarded-For');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const via = c.req.header('Via');
  if (via) {
    return via.split(',')[0].trim();
  }
  return 'unknown';
}

function getSizeInKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(2)}KB`;
}

export function logger(options: LoggerOptions = {}) {
  const {
    level = 'info',
    includeResponseBody = false,
    includeRequestBody = false,
    onLog,
  } = options;

  return async (c: AppContextType, next: Next) => {
    const startTime = Date.now();
    const method = c.req.method;
    const path = new URL(c.req.url).pathname;
    const ip = getClientIp(c);
    const userAgent = c.req.header('User-Agent') || 'unknown';

    // Capture request size
    let requestSize = 0;
    const contentLength = c.req.header('Content-Length');
    if (contentLength) {
      requestSize = parseInt(contentLength, 10);
    }

    try {
      await next();

      const duration = Date.now() - startTime;
      const status = c.res.status;
      const userId = c.get('userId');

      // Prepare log entry
      const logEntry: RequestLog = {
        timestamp: new Date().toISOString(),
        method,
        path,
        status,
        duration,
        ip,
        userAgent,
        userId,
        requestSize: requestSize > 0 ? requestSize : undefined,
      };

      // Get response size if available
      const responseContentLength = c.res.headers.get('Content-Length');
      if (responseContentLength) {
        logEntry.responseSize = parseInt(responseContentLength, 10);
      }

      // Call custom handler if provided
      if (onLog) {
        onLog(logEntry);
      }

      // Console output
      const statusColor = getStatusColor(status);
      const durationStr = formatDuration(duration);
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];

      let logMessage = `${LOG_COLORS.gray}${timestamp}${LOG_COLORS.reset} ${method.padEnd(6)} ${statusColor}${status}${LOG_COLORS.reset} ${path} ${durationStr}`;

      if (userId) {
        logMessage += ` ${LOG_COLORS.blue}[${userId}]${LOG_COLORS.reset}`;
      }

      if (requestSize > 0) {
        logMessage += ` ${LOG_COLORS.gray}(req: ${getSizeInKb(requestSize)})${LOG_COLORS.reset}`;
      }

      if (logEntry.responseSize) {
        logMessage += ` ${LOG_COLORS.gray}(res: ${getSizeInKb(logEntry.responseSize)})${LOG_COLORS.reset}`;
      }

      if (level === 'debug') {
        logMessage += ` ${LOG_COLORS.gray}${ip}${LOG_COLORS.reset}`;
      }

      console.log(logMessage);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      const logEntry: RequestLog = {
        timestamp: new Date().toISOString(),
        method,
        path,
        status: 500,
        duration,
        ip,
        userAgent,
        userId: c.get('userId'),
        error: errorMsg,
      };

      if (onLog) {
        onLog(logEntry);
      }

      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      console.error(
        `${LOG_COLORS.gray}${timestamp}${LOG_COLORS.reset} ${method.padEnd(6)} ${LOG_COLORS.red}500${LOG_COLORS.reset} ${path} ${formatDuration(duration)} ${LOG_COLORS.red}ERROR: ${errorMsg}${LOG_COLORS.reset}`
      );

      throw error;
    }
  };
}
