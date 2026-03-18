# Console AI 🤖

AI-powered error tracking and analysis system with automatic error explanation using Ollama LLM.

## Features

- 🔐 **User Authentication**: Secure JWT-based authentication
- 📁 **Project Management**: Organize errors by projects
- 🔑 **API Key Management**: Generate keys for error submission
- 🐛 **Error Tracking**: Track and store application errors
- 🤖 **AI Analysis**: Automatic error explanation using Ollama
- 📊 **Dashboard**: Beautiful web interface for monitoring
- 🌐 **REST API**: Complete API for integration

## Architecture

```
console-ai/
├── apps/
│   ├── api/          # Backend API (Hono + PostgreSQL)
│   └── web/          # Frontend Dashboard (HTML/CSS/JS)
└── packages/
    ├── ai/           # AI processing with Ollama
    ├── domain/       # Shared types and schemas
    └── sdk/          # Client SDK (future)
```

## Prerequisites

1. **Node.js** (v18 or higher)
2. **pnpm** (v8 or higher)
3. **PostgreSQL** (v14 or higher)
4. **Ollama** (for AI features)

### Install Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/download
```

Pull the required model:
```bash
ollama pull llama3.2
```

Start Ollama server:
```bash
ollama serve
```

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Database

Start PostgreSQL using Docker:
```bash
cd apps/api
docker-compose up -d
```

Run migrations:
```bash
cd apps/api
pnpm db:migrate
```

### 3. Configure Environment

Copy the example environment file:
```bash
cd apps/api
cp .env.example .env
```

Edit `.env` if needed (defaults should work):
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/console_ai
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
NODE_ENV=development
OLLAMA_MODEL=llama3.2
OLLAMA_BASE_URL=http://localhost:11434
```

### 4. Start Everything

**Option 1: Run API and Web together (Recommended)**
```bash
pnpm dev
```

This starts:
- API server on http://localhost:3000
- Web dashboard on http://localhost:8080

**Option 2: Run separately**
```bash
# Terminal 1 - API
pnpm dev:api

# Terminal 2 - Web
pnpm dev:web
```

### 5. Access the Dashboard

Open your browser to:
- **Web Dashboard**: http://localhost:8080
- **API**: http://localhost:3000

## Usage

### Web Dashboard

1. **Create Account**
   - Open http://localhost:8080
   - Click "Sign up"
   - Enter your details

2. **Create Project**
   - Navigate to "Projects"
   - Click "+ New Project"
   - Enter project details

3. **Generate API Key**
   - Click on a project
   - Click "+ New API Key"
   - Copy the generated key

4. **Submit Errors**
   - Use the web form OR
   - Use the API endpoint (see below)

### API Integration

Submit errors programmatically:

```javascript
fetch('http://localhost:3000/errors', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key-here'
  },
  body: JSON.stringify({
    message: 'TypeError: Cannot read property "name" of undefined',
    stack: 'at getUserName (app.js:15:23)\n    at processUser (app.js:42:10)',
    source: 'app.js',
    language: 'javascript',
    framework: 'Node.js'
  })
});
```

The API will:
1. Validate the error data
2. Process it with AI (Ollama)
3. Store it in the database with AI analysis
4. Return the error with AI insights

### API Endpoints

**Authentication:**
- `POST /users/signup` - Create account
- `POST /users/signin` - Login
- `GET /users/me` - Get profile

**Projects:**
- `GET /projects` - List projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

**API Keys:**
- `POST /projects/:projectId/api-keys` - Create API key
- `GET /projects/:projectId/api-keys` - List API keys
- `DELETE /projects/:projectId/api-keys/:keyId` - Delete API key

**Errors:**
- `POST /errors` - Submit error (requires API key)
- `GET /events` - List errors (requires auth)
- `GET /events/:id` - Get error details
- `DELETE /events/:id` - Delete error

## Development

### Project Structure

- **apps/api**: Backend API server
  - Hono framework
  - PostgreSQL with Drizzle ORM
  - JWT authentication
  - API key validation

- **apps/web**: Frontend dashboard
  - Pure HTML/CSS/JavaScript
  - No build step required
  - Responsive design
  - Real-time updates

- **packages/ai**: AI processing
  - Ollama integration
  - Error analysis prompts
  - LangChain for LLM interaction

- **packages/domain**: Shared code
  - Zod schemas
  - TypeScript types
  - Validation logic

### Available Scripts

```bash
# Run both API and web
pnpm dev

# Run API only
pnpm dev:api

# Run web only
pnpm dev:web

# Database operations
cd apps/api
pnpm db:generate    # Generate migrations
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Drizzle Studio

# Test AI processing
cd packages/ai
pnpm dev
```

## Testing

### Test AI Processing

```bash
cd packages/ai
pnpm dev
```

This will run test cases and show AI-generated explanations.

### Test API

Use the provided examples in [`apps/api/CLIENT_EXAMPLE.md`](apps/api/CLIENT_EXAMPLE.md:1)

## Troubleshooting

### Ollama Connection Issues

If you see "Failed to generate explanation":
1. Ensure Ollama is running: `ollama serve`
2. Check the model is installed: `ollama list`
3. Pull the model if needed: `ollama pull llama3.2`

### Database Connection Issues

1. Check PostgreSQL is running: `docker ps`
2. Verify connection string in `.env`
3. Run migrations: `pnpm db:migrate`

### Port Already in Use

If port 3000 or 8080 is in use:
1. Change `PORT` in `apps/api/.env`
2. Update `API_BASE_URL` in `apps/web/app.js`

## Production Deployment

### API

1. Build the API:
   ```bash
   cd apps/api
   pnpm build
   ```

2. Set production environment variables
3. Run: `pnpm start`

### Web

The web app is static HTML/CSS/JS:
1. Deploy to any static hosting (Netlify, Vercel, S3, etc.)
2. Update `API_BASE_URL` in `app.js` to your production API URL

## Documentation

- [API Documentation](apps/api/README.md)
- [API Structure](apps/api/API_STRUCTURE.md)
- [Quick Start Guide](apps/api/QUICKSTART.md)
- [Client Examples](apps/api/CLIENT_EXAMPLE.md)
- [Web App Guide](apps/web/README.md)

## Tech Stack

**Backend:**
- Hono (Web framework)
- PostgreSQL (Database)
- Drizzle ORM (Database toolkit)
- JWT (Authentication)
- Zod (Validation)

**Frontend:**
- Vanilla JavaScript
- Modern CSS
- Responsive design

**AI:**
- Ollama (Local LLM)
- LangChain (LLM framework)
- Llama 3.2 (Language model)

## License

ISC

## Made with Bob 🤖