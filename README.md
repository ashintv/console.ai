# Console AI - AI-Powered Error Tracking System

An intelligent error tracking and analysis system that uses AI to provide detailed explanations and solutions for errors in your applications.

## 🚀 Features

- **AI-Powered Analysis**: Automatic error analysis using Ollama AI
- **Real-time Processing**: Instant error processing and storage
- **Web Dashboard**: Beautiful UI to view and manage errors
- **SDK Integration**: Drop-in replacement for console.error()
- **Project Management**: Organize errors by projects
- **Authentication**: Secure API key-based authentication
- **Example App**: Interactive demo showcasing all features

## 📦 Project Structure

```
console-ai/
├── apps/
│   ├── api/          # Express API server
│   ├── web/          # Web dashboard
│   └── example/      # Example integration app
├── packages/
│   ├── ai/           # AI processing logic
│   ├── domain/       # Shared domain models
│   └── sdk/          # Client SDK
```

## 🛠️ Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- Ollama with llama3.2 model

## 📥 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd console-ai
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up PostgreSQL**
```bash
# Start PostgreSQL with Docker
cd apps/api
docker-compose up -d
```

4. **Configure environment**
```bash
cd apps/api
cp .env.example .env
# Edit .env with your database credentials
```

5. **Run migrations**
```bash
cd apps/api
pnpm db:migrate
```

6. **Install Ollama and pull model**
```bash
# Install Ollama from https://ollama.ai
ollama pull llama3.2
```

## 🚀 Quick Start

### Start the API Server
```bash
pnpm dev:api
# API runs on http://localhost:3000
```

### Start the Web Dashboard
```bash
pnpm dev:web
# Dashboard runs on http://localhost:8080
```

### Run the Example App
```bash
pnpm dev:example
# Example runs on http://localhost:2020
```

## 📚 Usage

### 1. Create a Project

**Via API:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My App",
    "description": "Production application"
  }'
```

**Via Web Dashboard:**
1. Open http://localhost:8080
2. Click "Create Project"
3. Fill in project details

### 2. Get API Key

After creating a project, you'll receive an API key. Save it securely.

### 3. Integrate SDK

**Install SDK:**
```bash
npm install @console-ai/sdk
```

**Use in your code:**
```typescript
import { ConsoleAI } from '@console-ai/sdk';

const consoleAI = new ConsoleAI({
  apiKey: 'your-api-key',
  apiUrl: 'http://localhost:3000',
  mode: 'log' // or 'trace'
});

// Replace console.error with consoleAI.error
try {
  // Your code
} catch (error) {
  await consoleAI.error(error);
}
```

### 4. View Errors

**Via Web Dashboard:**
1. Open http://localhost:8080
2. Select your project
3. View errors with AI explanations

**Via API:**
```bash
curl http://localhost:3000/api/errors?projectId=<project-id> \
  -H "x-api-key: your-api-key"
```

## 🎮 Example App

The example app demonstrates various error scenarios:

1. **Start the example:**
```bash
pnpm dev:example
```

2. **Open browser:**
```
http://localhost:2020
```

3. **Try different errors:**
   - HTTP errors (500, 404, 403, timeout)
   - Runtime errors (null reference, undefined property)
   - Database errors
   - Validation errors
   - Custom errors

## 🔧 SDK Modes

### Log Mode (Development)
Prints AI explanation to console immediately:
```typescript
const consoleAI = new ConsoleAI({
  apiKey: 'your-api-key',
  mode: 'log'
});
```

### Trace Mode (Production)
Silently sends errors to API without blocking:
```typescript
const consoleAI = new ConsoleAI({
  apiKey: 'your-api-key',
  mode: 'trace'
});
```

## 📖 API Documentation

### Authentication
All API requests require an API key:
```
x-api-key: your-api-key
```

### Endpoints

#### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project details

#### Errors
- `POST /api/errors` - Submit error
- `GET /api/errors` - List errors
- `GET /api/errors/:id` - Get error details

#### Users
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user

See [API_STRUCTURE.md](apps/api/API_STRUCTURE.md) for detailed documentation.

## 🏗️ Architecture

### Error Flow
```
User Code → SDK → API → AI Processing → Database → Response
```

### Components

1. **SDK** (`packages/sdk`)
   - Client library for error submission
   - Two modes: log (dev) and trace (prod)
   - Automatic error serialization

2. **API** (`apps/api`)
   - Express server with TypeScript
   - PostgreSQL with Drizzle ORM
   - JWT authentication
   - Rate limiting and security

3. **AI Package** (`packages/ai`)
   - Ollama integration
   - Error analysis and explanation
   - Solution suggestions

4. **Web Dashboard** (`apps/web`)
   - Modern UI with Tailwind CSS
   - Project and error management
   - Real-time updates

## 🧪 Development

### Run Tests
```bash
pnpm test
```

### Database Migrations
```bash
cd apps/api
pnpm db:generate  # Generate migration
pnpm db:migrate   # Run migration
pnpm db:studio    # Open Drizzle Studio
```

### Build for Production
```bash
pnpm build
```

## 🔒 Security

- API key authentication
- Rate limiting on all endpoints
- Input validation and sanitization
- SQL injection protection via Drizzle ORM
- CORS configuration
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation in each package
- Review the example app for integration patterns

## 🎯 Roadmap

- [ ] Error grouping and deduplication
- [ ] Email notifications
- [ ] Slack integration
- [ ] Error trends and analytics
- [ ] Source map support
- [ ] Multi-language support
- [ ] Cloud deployment guides
- [ ] Performance monitoring

## 📊 Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL, Drizzle ORM
- **AI**: Ollama (llama3.2)
- **Frontend**: Vanilla JS, Tailwind CSS
- **Package Manager**: pnpm
- **Monorepo**: pnpm workspaces

---

Built with ❤️ for better error tracking and debugging