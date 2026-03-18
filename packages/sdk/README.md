
# @console-ai/sdk

Drop-in replacement for `console.error()` with AI-powered explanations.

## Why Console AI?

Stop guessing what errors mean. Get instant AI explanations:

```typescript
// Before
console.error(error);
// Output: TypeError: Cannot read property 'name' of undefined

// After
await consoleAI.error(error);
// Output: 
// ❌ Error: Cannot read property 'name' of undefined
// 📍 Stack Trace: at getUserName (app.ts:15:23)...
// 🤖 AI Explanation: This error occurs when trying to access the 'name' 
//    property of an undefined object. The 'user' variable is undefined.
//    Add a null check before accessing properties: if (user) { ... }
```

## Installation

```bash
npm install @console-ai/sdk
```

## Quick Start

### 1. Get Your API Key

1. Open http://localhost:8080
2. Create an account
3. Create a project  
4. Generate an API key

### 2. Initialize

```typescript
import { ConsoleAI } from '@console-ai/sdk';

const consoleAI = new ConsoleAI({
  apiKey: 'your-api-key-here',
  mode: 'log', // 'log' or 'trace'
});
```

### 3. Use It

```typescript
try {
  // your code
} catch (error) {
  await consoleAI.error(error); // That's it!
}
```

## Two Modes

### Log Mode (Development)

Prints error + AI explanation to console:

```typescript
const consoleAI = new ConsoleAI({
  apiKey: 'your-key',
  mode: 'log', // Print to console with AI explanation
});

await consoleAI.error(new Error('Payment failed'));
```

**Output:**
```
❌ Error: Payment failed
📍 Stack Trace: at processPayment (payment.ts:42:10)...
🤖 AI Explanation: This error suggests the payment gateway...
────────────────────────────────────────────────────────────
```

### Trace Mode (Production)

Saves errors to database silently:

```typescript
const consoleAI = new ConsoleAI({
  apiKey: 'your-key',
  mode: 'trace', // Save to database, no console output
});

await consoleAI.error(new Error('Payment failed'));
// No console output
// Error saved to database
// View in dashboard: http://localhost:8080
```

## Configuration

```typescript
interface ConsoleAIConfig {
  apiKey: string;           // Required: Your API key
  baseUrl?: string;         // Optional: API URL (default: http://localhost:3000)
  mode?: 'log' | 'trace';   // Optional: Mode (default: 'log')
  language?: string;        // Optional: Language (auto-detected)
  framework?: string;       // Optional: Framework name
}
```

## Real-World Examples

### Express.js API

```typescript
import express from 'express';
import { ConsoleAI } from '@console-ai/sdk';

const app = express();
const consoleAI = new ConsoleAI({
  apiKey: process.env.CONSOLE_AI_KEY!,
  mode: process.env.NODE_ENV === 'production' ? 'trace' : 'log',
  framework: 'Express',
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await getUser(req.params.id);
    res.json(user);
  } catch (error) {
    await consoleAI.error(error); // AI-powered logging
    res.status(500).json({ error: 'Internal error' });
  }
});
```

### React Component

```typescript
import { ConsoleAI } from '@console-ai/sdk';

const consoleAI = new ConsoleAI({
  apiKey: import.meta.env.VITE_CONSOLE_AI_KEY,
  mode: 'log',
  framework: 'React',
});

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(error => consoleAI.error(error));
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

### Next.js

```typescript
// app/error.tsx
'use client';

import { ConsoleAI } from '@console-ai/sdk';
import { useEffect } from 'react';

const consoleAI = new ConsoleAI({
  apiKey: process.env.NEXT_PUBLIC_CONSOLE_AI_KEY!,
  mode: 'trace',
  framework: 'Next.js',
});

export default function Error({ error }: { error: Error }) {
  useEffect(() => {
    consoleAI.error(error);
  }, [error]);

  return <div>Something went wrong!</div>;
}
```

### Background Jobs

```typescript
import { ConsoleAI } from '@console-ai/sdk';

const consoleAI = new ConsoleAI({
  apiKey: process.env.CONSOLE_AI_KEY!,
  mode: 'trace',
  language: 'typescript',
});

async function processJob(job) {
  try {
    await job.execute();
  } catch (error) {
    await consoleAI.error(error);
    throw error; // Re-throw for job queue
  }
}
```

## API Reference

### `ConsoleAI`

#### Constructor

```typescript
new ConsoleAI(config: ConsoleAIConfig)
```

#### Methods

##### `error(...args: any[])`

Log an error with AI explanation. Works exactly like `console.error()`.

```typescript
new ConsoleAI(config: ConsoleAIConfig)
```

#### Methods

##### `error(...args: any[])`

Log an error with AI explanation. Works exactly like `console.error()`.

```typescript
consoleAI.error(error);
consoleAI.error('Error message');
consoleAI.error('Multiple', 'arguments', 'supported');
```

##### `warn(...args: any[])`

Alias for `error()`. Works like `console.warn()`.

```typescript
consoleAI.warn('Warning message');
```

## How It Works

1. **You call** `consoleAI.error(error)`
2. **SDK sends** error to API with stack trace and context
3. **API processes** error with AI (Ollama LLM)
4. **SDK receives** AI explanation
5. **In log mode**: Prints error + AI explanation to console
6. **In trace mode**: Saves to database (view in dashboard)

## Testing

Run the example:

```bash
cd packages/sdk
pnpm dev
```

Make sure:
1. API server is running (`pnpm dev:api`)
2. Update API key in [`example.ts`](src/example.ts:13)
3. Have Ollama running (`ollama serve`)

## Comparison

### Traditional Logging

```typescript
try {
  const user = await getUser(id);
  console.log(user.name);
} catch (error) {
  console.error(error);
  // Output: TypeError: Cannot read property 'name' of undefined
  // You: "What does this mean? Where's the bug?"
}
```

### With Console AI

```typescript
try {
  const user = await getUser(id);
  console.log(user.name);
} catch (error) {
  await consoleAI.error(error);
  // Output: 
  // ❌ Error: TypeError: Cannot read property 'name' of undefined
  // 📍 Stack: at main (app.ts:15:23)
  // 🤖 AI: This error occurs because 'user' is undefined. The getUser()
  //    function likely returned undefined instead of a user object.
  //    Add a null check: if (user) { console.log(user.name); }
}
```

## Production Setup

```typescript
// config.ts
export const consoleAI = new ConsoleAI({
  apiKey: process.env.CONSOLE_AI_KEY!,
  mode: process.env.NODE_ENV === 'production' ? 'trace' : 'log',
  language: 'typescript',
  framework: 'Express',
});

// app.ts
import { consoleAI } from './config';

app.get('/api/data', async (req, res) => {
  try {
    const data = await fetchData();
    res.json(data);
  } catch (error) {
    consoleAI.error(error); // Logged in dev, traced in prod
    res.status(500).json({ error: 'Internal error' });
  }
});
```

## TypeScript Support

Full TypeScript support included:

```typescript
import { ConsoleAI, type ConsoleAIConfig } from '@console-ai/sdk';
```

## Browser Support

Works in browsers too:

```html
<script type="module">
  import { ConsoleAI } from '@console-ai/sdk';
  
  const consoleAI = new ConsoleAI({
    apiKey: 'your-key',
    mode: 'log',
  });
  
  window.onerror = (msg, url, line, col, error) => {
    consoleAI.error(error || msg);
  };
</script>
```

## Made with Bob 🤖