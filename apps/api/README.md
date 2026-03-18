# Console AI API

A Hono-based REST API for error tracking and event logging with AI-powered analysis.

## Features

- 🔐 User authentication (signup/signin with JWT)
- 📦 Project management
- 🔑 API key generation and management
- 📊 Event logging and tracking
- 🤖 AI-powered error analysis (coming soon)
- 🐘 PostgreSQL database with Drizzle ORM

## Tech Stack

- **Framework**: Hono
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Runtime**: Node.js

## Prerequisites

- Node.js 18+ 
- pnpm
- Docker & Docker Compose (for PostgreSQL)

## Getting Started

### 1. Install Dependencies

```bash
cd apps/api
pnpm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and update the values:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/console_ai
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
NODE_ENV=development
```

### 3. Start PostgreSQL

```bash
docker-compose up -d
```

This will start a PostgreSQL container on port 5432.

### 4. Generate and Run Migrations

```bash
# Generate migration files
pnpm db:generate

# Run migrations
pnpm db:migrate
```

### 5. Start the Development Server

```bash
pnpm dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Health Check

```
GET /
```

### User Routes

```
POST   /users/signup    - Create a new user account
POST   /users/signin    - Sign in and get JWT token
GET    /users/me        - Get current user info (requires auth)
PUT    /users/me        - Update current user (requires auth)
```

### Project Routes

All project routes require authentication (Bearer token).

```
POST   /projects                      - Create a new project
GET    /projects                      - Get all user projects
GET    /projects/:id                  - Get a specific project
PUT    /projects/:id                  - Update a project
DELETE /projects/:id                  - Delete a project
POST   /projects/:id/api-keys         - Generate new API key
GET    /projects/:id/api-keys         - Get all API keys for project
DELETE /projects/:projectId/api-keys/:keyId - Delete an API key
```

### Event Routes

```
POST   /events                    - Log a new event (requires API key)
GET    /events                    - Get all events (requires auth)
GET    /events/:id                - Get a specific event (requires auth)
GET    /events/project/:projectId - Get events for a project (requires auth)
PUT    /events/:id                - Update event (requires auth)
DELETE /events/:id                - Delete event (requires auth)
```

## Usage Example

### 1. Sign Up

```bash
curl -X POST http://localhost:3000/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }'
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

### 2. Create a Project

```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My App",
    "description": "Production application"
  }'
```

Response:
```json
{
  "project": {
    "id": "project-uuid",
    "name": "My App",
    "description": "Production application"
  },
  "apiKey": {
    "id": "key-uuid",
    "key": "cai_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "name": "Default API Key",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Log an Event

Use the API key from your project to log events:

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -H "X-API-Key: cai_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "message": "TypeError: Cannot read property of undefined",
    "stack": "at Object.<anonymous> (/app/index.js:10:5)",
    "source": "/app/index.js:10:5",
    "language": "javascript",
    "framework": "express",
    "metadata": {
      "userAgent": "Mozilla/5.0...",
      "url": "/api/users"
    }
  }'
```

Response:
```json
{
  "event": {
    "id": "event-uuid",
    "message": "TypeError: Cannot read property of undefined",
    "aiAnalysis": "Error detected: TypeError: Cannot read property of undefined. Analysis pending...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Database Schema

### Users
- id (UUID, PK)
- email (VARCHAR, unique)
- password (TEXT, hashed)
- name (VARCHAR)
- createdAt, updatedAt (TIMESTAMP)

### Projects
- id (UUID, PK)
- userId (UUID, FK → users.id)
- name (VARCHAR)
- description (TEXT)
- createdAt, updatedAt (TIMESTAMP)

### API Keys
- id (UUID, PK)
- projectId (UUID, FK → projects.id)
- key (VARCHAR, unique)
- name (VARCHAR)
- lastUsedAt (TIMESTAMP)
- isActive (VARCHAR)
- createdAt (TIMESTAMP)

### Events
- id (UUID, PK)
- projectId (UUID, FK → projects.id)
- message (TEXT)
- stack (TEXT)
- source (TEXT)
- language (VARCHAR)
- framework (VARCHAR)
- aiAnalysis (TEXT)
- metadata (JSONB)
- createdAt (TIMESTAMP)

## Development Commands

```bash
# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Generate Drizzle migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

## Docker Commands

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs -f

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

## Authentication

### JWT Token
Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### API Key
Event logging requires an API key in the X-API-Key header:

```
X-API-Key: cai_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": [] // Optional validation details
}
```

Common status codes:
- 400: Bad Request (validation error)
- 401: Unauthorized (missing/invalid token or API key)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Next Steps

- [ ] Integrate AI analysis for events
- [ ] Add rate limiting
- [ ] Implement event filtering and search
- [ ] Add webhook support
- [ ] Create dashboard UI
- [ ] Add email notifications
- [ ] Implement event aggregation and analytics

## License

ISC