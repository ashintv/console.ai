# Console AI API Structure

## Project Overview

A complete Hono-based REST API for error tracking and event logging with PostgreSQL and Drizzle ORM.

## Directory Structure

```
apps/api/
├── src/
│   ├── db/
│   │   ├── schema.ts          # Database schema definitions
│   │   ├── index.ts           # Database connection
│   │   └── migrate.ts         # Migration runner
│   ├── middleware/
│   │   └── auth.ts            # Authentication middleware
│   ├── routes/
│   │   ├── users.ts           # User routes (signup, signin, profile)
│   │   ├── projects.ts        # Project CRUD + API key management
│   │   └── events.ts          # Event logging and retrieval
│   ├── utils/
│   │   └── auth.ts            # Auth utilities (hashing, JWT, API keys)
│   └── index.ts               # Main application entry point
├── drizzle/                   # Generated migration files
├── docker-compose.yml         # PostgreSQL container setup
├── drizzle.config.ts          # Drizzle ORM configuration
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── README.md                  # Full documentation
├── QUICKSTART.md              # Quick start guide
└── API_STRUCTURE.md           # This file
```

## Database Schema

### Tables

1. **users**
   - id (UUID, PK)
   - email (VARCHAR, unique)
   - password (TEXT, hashed)
   - name (VARCHAR)
   - createdAt, updatedAt (TIMESTAMP)

2. **projects**
   - id (UUID, PK)
   - userId (UUID, FK → users.id)
   - name (VARCHAR)
   - description (TEXT)
   - createdAt, updatedAt (TIMESTAMP)

3. **api_keys**
   - id (UUID, PK)
   - projectId (UUID, FK → projects.id)
   - key (VARCHAR, unique)
   - name (VARCHAR)
   - lastUsedAt (TIMESTAMP)
   - isActive (VARCHAR)
   - createdAt (TIMESTAMP)

4. **events**
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

### Relationships

- User → Projects (1:N)
- Project → API Keys (1:N)
- Project → Events (1:N)

## API Endpoints

### Health Check
- `GET /` - API health check

### User Routes (`/users`)
- `POST /users/signup` - Create new user account
- `POST /users/signin` - Sign in and get JWT token
- `GET /users/me` - Get current user info (auth required)
- `PUT /users/me` - Update current user (auth required)

### Project Routes (`/projects`)
All routes require JWT authentication.

- `POST /projects` - Create new project
- `GET /projects` - Get all user projects
- `GET /projects/:id` - Get specific project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `POST /projects/:id/api-keys` - Generate new API key
- `GET /projects/:id/api-keys` - Get all API keys
- `DELETE /projects/:projectId/api-keys/:keyId` - Delete API key

### Event Routes (`/events`)
- `POST /events` - Log new event (API key required)
- `GET /events` - Get all events (auth required)
- `GET /events/:id` - Get specific event (auth required)
- `GET /events/project/:projectId` - Get project events (auth required)
- `PUT /events/:id` - Update event (auth required)
- `DELETE /events/:id` - Delete event (auth required)

## Authentication

### JWT Authentication
Used for user-related operations.

**Header:**
```
Authorization: Bearer <jwt_token>
```

**Token contains:**
- userId
- Expires in 7 days

### API Key Authentication
Used for event logging from client applications.

**Header:**
```
X-API-Key: cai_<48_character_nanoid>
```

## Middleware

### authMiddleware
- Validates JWT token
- Extracts userId and adds to context
- Returns 401 if invalid/missing

### apiKeyMiddleware
- Validates API key
- Checks if key is active
- Updates lastUsedAt timestamp
- Returns 401 if invalid/missing

## Utilities

### auth.ts
- `hashPassword(password)` - Hash password with bcrypt
- `verifyPassword(password, hash)` - Verify password
- `generateToken(userId)` - Generate JWT token
- `verifyToken(token)` - Verify and decode JWT
- `generateApiKey()` - Generate unique API key

## Request/Response Examples

### Sign Up
**Request:**
```json
POST /users/signup
{
  "email": "user@example.com",
  "password": "securepass123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt.token.here"
}
```

### Create Project
**Request:**
```json
POST /projects
Authorization: Bearer <token>
{
  "name": "My App",
  "description": "Production app"
}
```

**Response:**
```json
{
  "project": {
    "id": "uuid",
    "userId": "uuid",
    "name": "My App",
    "description": "Production app",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "apiKey": {
    "id": "uuid",
    "key": "cai_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "name": "Default API Key",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Log Event
**Request:**
```json
POST /events
X-API-Key: cai_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
{
  "message": "TypeError: Cannot read property 'x' of undefined",
  "stack": "at Object.<anonymous> (/app/index.js:10:5)",
  "source": "/app/index.js:10:5",
  "language": "javascript",
  "framework": "express",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "url": "/api/users"
  }
}
```

**Response:**
```json
{
  "event": {
    "id": "uuid",
    "message": "TypeError: Cannot read property 'x' of undefined",
    "aiAnalysis": "Error detected: TypeError... Analysis pending...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Error Handling

All errors return JSON with this format:

```json
{
  "error": "Error message",
  "details": [] // Optional validation details
}
```

**Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (missing/invalid auth)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/console_ai
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
NODE_ENV=development
```

## Development Scripts

```bash
pnpm dev          # Start dev server with hot reload
pnpm build        # Build for production
pnpm start        # Start production server
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio
```

## Technology Stack

- **Framework**: Hono (lightweight web framework)
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Validation**: Zod
- **API Keys**: nanoid
- **Runtime**: Node.js with tsx

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT tokens with 7-day expiration
- API key validation and tracking
- CORS enabled
- Input validation with Zod
- SQL injection protection (Drizzle ORM)
- Cascade deletes for data integrity

## Future Enhancements

- [ ] AI-powered error analysis integration
- [ ] Rate limiting
- [ ] Event filtering and search
- [ ] Webhook support
- [ ] Email notifications
- [ ] Event aggregation and analytics
- [ ] Dashboard UI
- [ ] Real-time event streaming
- [ ] Team collaboration features
- [ ] Custom alert rules