# Console AI SDK - Example App

Interactive demo showcasing the Console AI SDK with real error scenarios.

## Features

- 🎯 **Hardcoded HTTP Errors**: Simulated 500, 404, 403, timeout, database, and validation errors
- ⚡ **Runtime Errors**: Real JavaScript errors (null reference, undefined property, JSON parse, async errors)
- ✏️ **Custom Error Form**: Submit your own error messages
- 🤖 **AI Explanations**: See AI-powered error analysis in the terminal

## Quick Start

### 1. Install Dependencies

```bash
cd apps/example
pnpm install
```

### 2. Update API Key

Edit [`src/server.ts`](src/server.ts:9) and replace `'your-api-key-here'` with your actual API key.

### 3. Start the Server

```bash
pnpm dev
```

### 4. Open in Browser

Navigate to http://localhost:2020

## How It Works

1. **Click any error button** on the web page
2. **Server triggers error** and calls `consoleAI.error()`
3. **SDK sends to API** at http://localhost:3000/errors
4. **API processes with AI** (Ollama)
5. **Terminal shows** formatted error + AI explanation

## Example Output

When you click "500 Internal Server Error":

```
❌ Error: Internal Server Error: Database connection failed

📍 Stack Trace:
at /Users/you/console-ai/apps/example/src/server.ts:227:17
at Layer.handle [as handle_request] (/node_modules/express/lib/router/layer.js:95:5)

🤖 AI Explanation:
This error indicates a database connection failure. Common causes include:
1. Database server is not running
2. Incorrect connection credentials
3. Network connectivity issues
4. Database server reached max connections

Solutions:
- Check if PostgreSQL is running: `pg_isready`
- Verify connection string in .env file
- Check firewall settings
- Implement connection pooling and retry logic

────────────────────────────────────────────────────────────────────
```

## Error Types

### Hardcoded Errors
- **500**: Internal server error
- **404**: Resource not found
- **403**: Forbidden access
- **Timeout**: Request timeout
- **Database**: Database connection error
- **Validation**: Input validation error

### Runtime Errors
- **Null Reference**: Accessing property of null
- **Undefined Property**: Accessing nested undefined property
- **JSON Parse**: Invalid JSON parsing
- **Async/Await**: Promise rejection

### Custom Error
Submit any error message and see what the AI says!

## Prerequisites

Make sure these are running:

1. **Console AI API** (port 3000)
   ```bash
   cd apps/api
   pnpm dev
   ```

2. **Ollama** (for AI analysis)
   ```bash
   ollama serve
   ```

3. **Valid API Key**
   - Create account at http://localhost:8080
   - Create a project
   - Generate API key
   - Update in [`server.ts`](src/server.ts:9)

## Configuration

Edit [`src/server.ts`](src/server.ts:8-13):

```typescript
const consoleAI = new ConsoleAI({
  apiKey: 'your-api-key-here',
  mode: 'log', // 'log' or 'trace'
  language: 'typescript',
  framework: 'Express',
});
```

**Modes:**
- `log`: Prints errors with AI explanations to console
- `trace`: Saves to database silently (view in dashboard)

## Port

Server runs on **port 2020** by default.

To change: Edit [`src/server.ts`](src/server.ts:5)

## Made with Bob 🤖