# Console AI SDKs

This directory contains official SDKs for Console AI in multiple programming languages.

## Available SDKs

### 1. TypeScript/JavaScript SDK (`sdk`)
**Location:** `/packages/sdk`

The original TypeScript SDK for Node.js environments.

**Features:**
- Error logging with AI explanations
- Console.error replacement
- Full type safety
- Support for browser and Node.js

**Installation:**
```bash
npm install @console-ai/sdk
```

**Usage:**
```typescript
import { ConsoleAI } from '@console-ai/sdk';

const console = new ConsoleAI({
  apiKey: 'your-api-key',
  mode: 'log'
});

try {
  throw new Error('Something went wrong');
} catch (e) {
  await console.error(e);
}
```

---

### 2. Python SDK (`sdk-python`)
**Location:** `/packages/sdk-python`

Python SDK for Django, Flask, FastAPI, and other Python web frameworks.

**Features:**
- Error logging with AI explanations
- Exception tracking
- Framework detection
- Production-ready

**Installation:**
```bash
pip install console-ai
```

**Usage:**
```python
from console_ai import ConsoleAI

console = ConsoleAI(api_key='your-api-key', mode='log')

try:
    raise ValueError('Something went wrong')
except Exception as e:
    console.error(e)
```

**Framework Examples:**
- Django
- Flask
- FastAPI
- Celery

---

### 3. Go SDK (`sdk-go`)
**Location:** `/packages/sdk-go`

Go SDK for Gin, Echo, and other Go web frameworks.

**Features:**
- Error logging with AI explanations
- Stack trace capture
- Context support
- Framework detection

**Installation:**
```bash
go get github.com/yourusername/console-ai-sdk
```

**Usage:**
```go
package main

import (
    "context"
    "console-ai-sdk"
)

func main() {
    console, _ := consoleai.New(consoleai.Config{
        APIKey: "your-api-key",
    })

    ctx := context.Background()
    err := someFunction()
    if err != nil {
        console.Error(ctx, err)
    }
}
```

**Framework Examples:**
- Gin
- Echo
- Fiber
- Standard Library

---

## Configuration

All SDKs support the same configuration options:

```
{
  apiKey: string          // Required - API key for authentication
  baseUrl: string         // Optional - API server URL (default: http://localhost:3000)
  mode: "log" | "trace"   // Optional - Output mode (default: "log")
  language: string        // Optional - Programming language (auto-detected)
  framework: string       // Optional - Framework name (e.g., "React", "Express", "Django")
}
```

### Modes

- **log**: Print error + AI explanation to console/stdout
- **trace**: Save error to database silently (no console output)

---

## Common Features

### 1. Error Logging
All SDKs provide `error()` method to log errors with AI explanations.

### 2. Stack Trace Capture
Automatic extraction of stack traces from errors.

### 3. Framework Detection
Automatic detection of programming language and framework.

### 4. AI Explanations
AI-powered analysis of errors with helpful suggestions.

### 5. API Integration
Communication with Console AI API via HTTP.

---

## File Structure

```
packages/
├── sdk/              # TypeScript/JavaScript SDK
│   ├── src/
│   ├── package.json
│   └── README.md
│
├── sdk-python/       # Python SDK
│   ├── console_ai/
│   │   └── __init__.py
│   ├── setup.py
│   ├── example.py
│   └── README.md
│
└── sdk-go/           # Go SDK
    ├── consoleai.go
    ├── go.mod
    ├── example/
    │   └── main.go
    └── README.md
```

---

## Adding New SDKs

To add a new SDK:

1. Create a new directory: `packages/sdk-{language}`
2. Follow the same structure as existing SDKs
3. Implement the core API (error logging, stack trace capture)
4. Add comprehensive examples
5. Create a detailed README
6. Update this document

---

## API Endpoints

All SDKs communicate with the same API:

### POST /errors
Log an error event

**Request:**
```json
{
  "message": "Error message",
  "stack": "Stack trace",
  "source": "source file or URL",
  "language": "javascript",
  "framework": "React"
}
```

**Response:**
```json
{
  "event": {
    "id": "event-id",
    "message": "Error message",
    "aiAnalysis": "AI-powered explanation..."
  }
}
```

---

## Authentication

All SDKs use API key authentication via the `X-API-Key` header:

```
X-API-Key: your-api-key
```

---

## Support

For issues, feature requests, or contributions:
- Create an issue in the main repository
- Check SDK-specific documentation in each package's README
- Review example files for usage patterns

---

## License

All SDKs are released under the ISC License
