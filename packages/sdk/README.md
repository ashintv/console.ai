# @console-ai/sdk

Official JavaScript/TypeScript SDK for Console AI - AI-powered error tracking and analysis.

## Features

- 🚀 **Easy Integration**: Simple setup with minimal configuration
- 🤖 **AI Analysis**: Automatic error analysis using Ollama LLM
- 🔄 **Auto-Capture**: Automatically track unhandled errors and rejections
- 📝 **Rich Context**: Include stack traces, source files, and custom metadata
- 🎯 **Type-Safe**: Full TypeScript support
- 🌐 **Universal**: Works in Node.js and browser environments
- 🎨 **Flexible**: Multiple ways to capture errors

## Installation

```bash
npm install @console-ai/sdk
# or
pnpm add @console-ai/sdk
# or
yarn add @console-ai/sdk
```

## Quick Start

### 1. Get Your API Key

1. Sign up at http://localhost:8080
2. Create a project
3. Generate an API key

### 2. Initialize the SDK

```typescript
import { ConsoleAI } from '@console-ai/sdk';

const client = new ConsoleAI({
  apiKey: 'your-api-key-here',
  language: 'typescript',
  framework: 'Express',
  autoCapture: true, // Automatically capture unhandled errors
});
```

### 3. Track Errors

```typescript
try {
  // Your code
  throw new Error('Something went wrong');
} catch (error) {
  await client.captureError(error);
}
```

## Configuration

```typescript
interface ConsoleAIConfig {
  /** API key for authentication (required) */
  apiKey: string;
  
  /** Base URL of the Console AI API (default: http://localhost:3000) */
  baseUrl?: string;
  
  /** Enable debug logging (default: false) */
  debug?: boolean;
  
  /** Automatically capture unhandled errors (default: false) */
  autoCapture?: boolean;
  
  /** Programming language (auto-detected if not provided) */
  language?: string;
  
  /** Framework name (e.g., 'React', 'Express', 'Next.js') */
  framework?: string;
  
  /** Additional metadata to include with all errors */
  metadata?: Record<string, any>;
}
```

## Usage Examples

### Basic Error Capture

```typescript
try {
  const result = riskyOperation();
} catch (error) {
  await client.captureError(error);
}
```

### Capture with Context

```typescript
try {
  await processUser(userId);
} catch (error) {
  await client.captureError(error, {
    source: 'user-service.ts',
    metadata: {
      userId,
      operation: 'processUser',
      timestamp: Date.now(),
    },
  });
}
```

### Capture Exception

```typescript
try {
  const data = JSON.parse(invalidJson);
} catch (error) {
  await client.captureException(error as Error, {
    source: 'parser.ts',
    metadata: {
      input: invalidJson,
      parser: 'JSON',
    },
  });
}
```

### Capture Message

```typescript
await client.captureMessage('Database connection timeout', {
  source: 'db.ts',
  metadata: {
    database: 'postgresql',
    timeout: 5000,
  },
});
```

### Auto-Capture Unhandled Errors

```typescript
// Enable auto-capture in config
const client = new ConsoleAI({
  apiKey: 'your-api-key',
  autoCapture: true, // Automatically captures unhandled errors
});

// Now all unhandled errors will be automatically tracked
throw new Error('This will be automatically captured');
```

### Context-Aware Capturing

```typescript
// Create a context-aware capturer
const apiContext = client.withContext({
  source: 'api-handler.ts',
  metadata: {
    endpoint: '/api/users',
    method: 'POST',
  },
});

// All errors captured with this context will include the metadata
try {
  await validateRequest(req);
} catch (error) {
  await apiContext.captureError(error);
}
```

### Wrap Functions

```typescript
// Wrap a function to automatically capture errors
async function riskyOperation() {
  throw new Error('Operation failed');
}

const wrapped = client.wrap(riskyOperation, {
  source: 'operations.ts',
  metadata: { operation: 'risky' },
});

try {
  await wrapped(); // Errors are automatically captured
} catch (error) {
  // Error was already sent to Console AI
  console.error('Operation failed');
}
```

### Submit Full Error Details

```typescript
await client.submitError({
  message: 'TypeError: Cannot read property "name" of undefined',
  stack: `at getUserName (app.ts:15:23)
    at processUser (app.ts:42:10)
    at main (app.ts:58:5)`,
  source: 'app.ts',
  language: 'typescript',
  framework: 'Express',
  metadata: {
    function: 'getUserName',
    line: 15,
    column: 23,
    severity: 'high',
    tags: ['user-management', 'critical'],
  },
});
```

## Framework Integration

### Express.js

```typescript
import express from 'express';
import { ConsoleAI } from '@console-ai/sdk';

const app = express();
const client = new ConsoleAI({
  apiKey: process.env.CONSOLE_AI_KEY!,
  framework: 'Express',
});

// Error handling middleware
app.use((err, req, res, next) => {
  client.captureError(err, {
    source: req.path,
    metadata: {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
    },
  });
  
  res.status(500).json({ error: 'Internal server error' });
});
```

### React

```typescript
import { ConsoleAI } from '@console-ai/sdk';
import { useEffect } from 'react';

const client = new ConsoleAI({
  apiKey: import.meta.env.VITE_CONSOLE_AI_KEY,
  framework: 'React',
  autoCapture: true,
});

// Error Boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
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

export default function Error({ error, reset }) {
  useEffect(() => {
    client.captureError(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## API Reference

### `ConsoleAI`

Main SDK client class.

#### Constructor

```typescript
new ConsoleAI(config: ConsoleAIConfig)
```

#### Methods

##### `captureError(error, context?)`

Capture and submit an error.

```typescript
await client.captureError(error, {
  source: 'file.ts',
  metadata: { key: 'value' },
});
```

##### `captureException(error, context?)`

Capture an exception with additional context.

```typescript
await client.captureException(error, {
  source: 'file.ts',
  metadata: { userId: '123' },
});
```

##### `captureMessage(message, context?)`

Capture a message as an error.

```typescript
await client.captureMessage('Something happened', {
  source: 'logger.ts',
});
```

##### `submitError(errorData)`

Submit error data directly.

```typescript
await client.submitError({
  message: 'Error message',
  stack: 'stack trace',
  source: 'file.ts',
  language: 'typescript',
  framework: 'Express',
  metadata: {},
});
```

##### `wrap(fn, context?)`

Wrap a function to automatically capture errors.

```typescript
const wrapped = client.wrap(myFunction, {
  source: 'file.ts',
});
```

##### `withContext(context)`

Create a context-aware error capturer.

```typescript
const contextCapturer = client.withContext({
  source: 'api.ts',
  metadata: { endpoint: '/users' },
});

await contextCapturer.captureError(error);
```

##### `getConfig()`

Get current configuration.

```typescript
const config = client.getConfig();
```

##### `updateConfig(updates)`

Update configuration.

```typescript
client.updateConfig({
  debug: true,
  framework: 'Next.js',
});
```

## Error Data Structure

```typescript
interface ErrorData {
  message: string;        // Error message (required)
  stack?: string;         // Stack trace
  source?: string;        // Source file
  language?: string;      // Programming language
  framework?: string;     // Framework name
  metadata?: Record<string, any>; // Custom metadata
}
```

## Best Practices

1. **Include Context**: Always provide source file and relevant metadata
2. **Use Auto-Capture**: Enable for production to catch unexpected errors
3. **Add Metadata**: Include user IDs, request IDs, or other relevant data
4. **Wrap Critical Functions**: Use `wrap()` for important async operations
5. **Use Context**: Create context-aware capturers for related operations

## Environment Variables

```bash
# .env
CONSOLE_AI_API_KEY=your-api-key-here
CONSOLE_AI_BASE_URL=http://localhost:3000
```

## Testing

Run the example file:

```bash
cd packages/sdk
pnpm dev
```

Make sure to:
1. Update the API key in [`example.ts`](src/example.ts:19)
2. Ensure the API server is running
3. Have a project with an API key created

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions.

```typescript
import { ConsoleAI, type ErrorData, type ErrorResponse } from '@console-ai/sdk';
```

## Browser Support

The SDK works in both Node.js and browser environments:

```html
<script type="module">
  import { ConsoleAI } from '@console-ai/sdk';
  
  const client = new ConsoleAI({
    apiKey: 'your-api-key',
  });
  
  window.onerror = (msg, url, line, col, error) => {
    client.captureError(error || msg);
  };
</script>
```

## Contributing

See the main [README](../../README.md) for contribution guidelines.

## License

ISC

## Made with Bob 🤖