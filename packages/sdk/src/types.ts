/**
 * Extended error data with additional tracking capabilities
 */
export interface ExtendedErrorData {
  message: string;
  stack?: string;
  source?: string;
  language?: string;
  framework?: string;
  metadata?: Record<string, any>;
  
  // Additional tracking fields
  code?: string;              // Error code (e.g., 'ERR_CONNECTION_REFUSED')
  context?: string;           // Code context around the error
  severity?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];            // Tags for categorization
  userId?: string;            // User who encountered the error
  sessionId?: string;         // Session identifier
  requestId?: string;         // Request identifier
  environment?: string;       // Environment (dev, staging, prod)
  version?: string;           // Application version
  
  // Performance metrics
  timestamp?: number;         // When the error occurred
  duration?: number;          // How long the operation took before failing
  memoryUsage?: number;       // Memory usage at time of error
  
  // Browser-specific
  userAgent?: string;         // Browser user agent
  url?: string;               // URL where error occurred
  viewport?: {                // Viewport dimensions
    width: number;
    height: number;
  };
  
  // Network-specific
  statusCode?: number;        // HTTP status code
  endpoint?: string;          // API endpoint
  method?: string;            // HTTP method
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Common error categories
 */
export enum ErrorCategory {
  NETWORK = 'network',
  DATABASE = 'database',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_API = 'external_api',
  CONFIGURATION = 'configuration',
  UNKNOWN = 'unknown',
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  duration: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

/**
 * Browser context
 */
export interface BrowserContext {
  userAgent: string;
  url: string;
  viewport: {
    width: number;
    height: number;
  };
  referrer?: string;
  language?: string;
}

/**
 * Request context
 */
export interface RequestContext {
  method: string;
  endpoint: string;
  statusCode?: number;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
}

// Made with Bob
