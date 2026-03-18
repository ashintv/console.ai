# Console AI SDK - Usage Guide

Complete guide for integrating Console AI error tracking into your applications.

## Table of Contents

- [Installation](#installation)
- [Basic Setup](#basic-setup)
- [Error Tracking Methods](#error-tracking-methods)
- [Framework Integration](#framework-integration)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)

## Installation

```bash
npm install @console-ai/sdk
```

## Basic Setup

### Node.js / TypeScript

```typescript
import { ConsoleAI } from '@console-ai/sdk';

const client = new ConsoleAI({
  apiKey: process.env.CONSOLE_AI_KEY!,
  language: 'typescript',
  framework: 'Express',
  autoCapture: true,
  metadata: {
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  },
});
```

### Browser / JavaScript

```javascript
import { ConsoleAI } from '@console-ai/sdk';

const client = new ConsoleAI({
  apiKey: 'your-api-key',
  language: 'javascript',
  framework: 'React',
  autoCapture: true,
});
```

## Error Tracking Methods

### 1. Manual Error Capture

```typescript
try {
  await riskyOperation();
} catch (error) {
  await client.captureError(error, {
    source: 'operations.ts',
    metadata: {
      operation: 'riskyOperation',
      userId: currentUser.id,
    },
  });
}
```

### 2. Exception Capture

```typescript
try {
  const user = await fetchUser(userId);
  console.log(user.name);
} catch (error) {
  await client.captureException(error as Error, {
    source: 'user-service.ts',
    metadata: {
      userId,
      function: 'fetchUser',
    },
  });
}
```

### 3. Message Capture

```typescript
// Log important events as errors
await client.captureMessage('Payment processing failed', {
  source: 'payment-service.ts',
  metadata: {
    orderId: '12345',
    amount: 99.99,
    reason: 'insufficient_funds',
  },
});
```

### 4. Direct Submission

```typescript
await client.submitError({
  message: 'Database query timeout',
  stack: error.stack,
  source: 'db-service.ts',
  language: 'typescript',
  framework: 'Prisma',
  metadata: {
    query: 'SELECT * FROM users',
    timeout: 5000,
    database: 'postgresql',
  },
});
```

## Framework Integration

### Express.js

```typescript
import express from 'express';
import { ConsoleAI, expressErrorHandler } from '@console-ai/sdk';

const app = express();
const client = new ConsoleAI({
  apiKey: process.env.CONSOLE_AI_KEY!,
  framework: 'Express',
});

// Add error handler middleware (must be last)
app.use(expressErrorHandler(client));

app.listen(3000);
```

### React with Error Boundary

```typescript
import React from 'react';
import { ConsoleAI } from '@console-ai/sdk';

const client = new ConsoleAI({
  apiKey: import.meta.env.VITE_CONSOLE_AI_KEY,
  framework: 'React',
});

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    client.captureError(error, {
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  render() {
    return this.props.children;
  }
}

// Wrap your app
function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Next.js

```typescript
// app/error.tsx
'use client';

import { ConsoleAI } from '@console-ai/sdk';
import { useEffect } from 'react';

const client = new ConsoleAI({
  apiKey: process.env.NEXT_PUBLIC_CONSOLE_AI_KEY!,
  framework: 'Next.js',
});

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    client.captureError(error, {
      metadata: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Fastify

```typescript
import Fastify from 'fastify';
import { ConsoleAI, fastifyErrorHandler } from '@console-ai/sdk';

const fastify = Fastify();
const client = new ConsoleAI({
  apiKey: process.env.CONSOLE_AI_KEY!,
  framework: 'Fastify',
});

fastify.setErrorHandler(fastifyErrorHandler(client));

fastify.listen({ port: 3000 });
```

### Vue.js

```typescript
import { createApp } from 'vue';
import { ConsoleAI, vueErrorHandler } from '@console-ai/sdk';

const client = new ConsoleAI({
  apiKey: import.meta.env.VITE_CONSOLE_AI_KEY,
  framework: 'Vue',
});

const app = createApp(App);
app.config.errorHandler = vueErrorHandler(client);
app.mount('#app');
```

## Advanced Features

### Context-Aware Capturing

```typescript
// Create a capturer with consistent context
const apiContext = client.withContext({
  source: 'api-handler.ts',
  metadata: {
    service: 'user-api',
    version: '2.0',
  },
});

// All captures include the context
await apiContext.captureError(error1);
await apiContext.captureError(error2);
await apiContext.captureMessage('API rate limit exceeded');
```

### Function Wrapping

```typescript
// Wrap async functions for automatic error tracking
async function processPayment(orderId: string) {
  // Payment logic that might fail
  throw new Error('Payment gateway timeout');
}

const trackedPayment = client.wrap(processPayment, {
  source: 'payment-service.ts',
  metadata: {
    service: 'stripe',
  },
});

// Errors are automatically captured
try {
  await trackedPayment('order-123');
} catch (error) {
  // Error already sent to Console AI
  console.error('Payment failed');
}
```

### Tracked Fetch Requests

```typescript
import { createTrackedFetch } from '@console-ai/sdk';

const trackedFetch = createTrackedFetch(client);

// Automatically tracks failed requests
const response = await trackedFetch('https://api.example.com/data', {
  method: 'POST',
  body: JSON.stringify({ data }),
});
```

### Performance Tracking

```typescript
import { trackPerformance } from '@console-ai/sdk';

async function slowOperation() {
  // Slow operation that might fail
  await heavyComputation();
}

const tracked = trackPerformance(client, slowOperation, {
  source: 'compute.ts',
  metadata: {
    operation: 'heavyComputation',
  },
});

// Captures errors with duration and memory metrics
await tracked();
```

## Best Practices

### 1. Include Rich Context

```typescript
await client.captureError(error, {
  source: 'user-service.ts',
  metadata: {
    userId: user.id,
    operation: 'updateProfile',
    requestId: req.id,
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
  },
});
```

### 2. Use Appropriate Methods

```typescript
// For caught exceptions
await client.captureException(error);

// For custom messages
await client.captureMessage('Rate limit exceeded');

// For full control
await client.submitError({
  message: error.message,
  stack: error.stack,
  source: 'file.ts',
  language: 'typescript',
  framework: 'Express',
  metadata: { /* ... */ },
});
```

### 3. Enable Auto-Capture in Production

```typescript
const client = new ConsoleAI({
  apiKey: process.env.CONSOLE_AI_KEY!,
  autoCapture: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
});
```

### 4. Add User Context

```typescript
// Set user context for all errors
client.updateConfig({
  metadata: {
    userId: currentUser.id,
    email: currentUser.email,
    role: currentUser.role,
  },
});
```

### 5. Categorize Errors

```typescript
await client.captureError(error, {
  metadata: {
    category: 'database',
    severity: 'high',
    tags: ['postgresql', 'timeout'],
  },
});
```

## Real-World Examples

### E-commerce Checkout

```typescript
async function processCheckout(cart: Cart, user: User) {
  const checkoutContext = client.withContext({
    source: 'checkout-service.ts',
    metadata: {
      userId: user.id,
      cartTotal: cart.total,
      itemCount: cart.items.length,
    },
  });

  try {
    // Validate cart
    await validateCart(cart);
    
    // Process payment
    const payment = await processPayment(cart.total);
    
    // Create order
    const order = await createOrder(cart, payment);
    
    return order;
  } catch (error) {
    await checkoutContext.captureError(error as Error);
    throw error;
  }
}
```

### API Request Handler

```typescript
app.post('/api/users', async (req, res) => {
  const requestContext = client.withContext({
    source: 'user-api.ts',
    metadata: {
      endpoint: '/api/users',
      method: 'POST',
      requestId: req.id,
      ip: req.ip,
    },
  });

  try {
    const user = await createUser(req.body);
    res.json({ user });
  } catch (error) {
    await requestContext.captureError(error as Error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});
```

### Background Job Processing

```typescript
async function processJob(job: Job) {
  const jobContext = client.withContext({
    source: 'job-processor.ts',
    metadata: {
      jobId: job.id,
      jobType: job.type,
      attempt: job.attempts,
    },
  });

  const startTime = Date.now();

  try {
    await job.execute();
    
    // Log success metrics
    console.log(`Job ${job.id} completed in ${Date.now() - startTime}ms`);
  } catch (error) {
    await jobContext.captureError(error as Error, {
      metadata: {
        duration: Date.now() - startTime,
        failed: true,
      },
    });
    throw error;
  }
}
```

### Database Operations

```typescript
async function queryDatabase(sql: string, params: any[]) {
  const startTime = Date.now();
  
  try {
    return await db.query(sql, params);
  } catch (error) {
    await client.captureError(error as Error, {
      source: 'database.ts',
      metadata: {
        query: sql,
        params,
        duration: Date.now() - startTime,
        database: 'postgresql',
      },
    });
    throw error;
  }
}
```

## Environment-Specific Configuration

### Development

```typescript
const client = new ConsoleAI({
  apiKey: process.env.CONSOLE_AI_KEY!,
  debug: true,
  autoCapture: false, // Manual capture for debugging
  metadata: {
    environment: 'development',
  },
});
```

### Production

```typescript
const client = new ConsoleAI({
  apiKey: process.env.CONSOLE_AI_KEY!,
  debug: false,
  autoCapture: true, // Catch all unhandled errors
  metadata: {
    environment: 'production',
    version: process.env.APP_VERSION,
    region: process.env.AWS_REGION,
  },
});
```

## Testing

Run the example file to test the SDK:

```bash
cd packages/sdk
pnpm dev
```

Make sure to:
1. Update the API key in [`example.ts`](src/example.ts:19)
2. Have the API server running on http://localhost:3000
3. Have created a project with an API key

## Troubleshooting

### API Connection Issues

```typescript
// Check if API is reachable
const client = new ConsoleAI({
  apiKey: 'your-key',
  baseUrl: 'http://localhost:3000',
  debug: true, // Enable debug logging
});
```

### Rate Limiting

```typescript
import { debounce } from '@console-ai/sdk';

// Debounce error submissions
const debouncedCapture = debounce(
  (error) => client.captureError(error),
  1000 // Wait 1 second between submissions
);
```

### Memory Leaks

```typescript
// Don't store the client in global scope unnecessarily
// Create it once and reuse

// Good
const client = new ConsoleAI({ apiKey: 'key' });
export default client;

// Bad
setInterval(() => {
  new ConsoleAI({ apiKey: 'key' }); // Creates new instance every time
}, 1000);
```

## TypeScript Types

```typescript
import {
  ConsoleAI,
  type ConsoleAIConfig,
  type ErrorData,
  type ErrorResponse,
  type ExtendedErrorData,
  ErrorSeverity,
  ErrorCategory,
} from '@console-ai/sdk';
```

## Made with Bob 🤖