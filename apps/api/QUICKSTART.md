# Quick Start Guide

Get the Console AI API up and running in 5 minutes!

## Prerequisites

- Node.js 18+
- pnpm
- Docker & Docker Compose

## Setup Steps

### 1. Navigate to the API directory

```bash
cd apps/api
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

The default `.env` values work for local development. For production, update:
- `JWT_SECRET` - Use a strong random secret
- `DATABASE_URL` - Update if using a different database

### 4. Start PostgreSQL

```bash
docker-compose up -d
```

Wait a few seconds for PostgreSQL to be ready.

### 5. Run database migrations

```bash
pnpm db:migrate
```

### 6. Start the development server

```bash
pnpm dev
```

The API is now running at `http://localhost:3000`! 🎉

## Test the API

### 1. Create a user account

```bash
curl -X POST http://localhost:3000/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Save the `token` from the response.

### 2. Create a project

```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "My First Project",
    "description": "Testing the API"
  }'
```

Save the `apiKey.key` from the response.

### 3. Log an event

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -d '{
    "message": "Test error message",
    "language": "javascript",
    "stack": "Error: Test\n    at Object.<anonymous> (/app/index.js:10:5)"
  }'
```

### 4. View your events

```bash
curl http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## What's Next?

- Read the full [README.md](./README.md) for detailed API documentation
- Explore the database with `pnpm db:studio`
- Integrate the API into your application
- Set up AI analysis for events (coming soon)

## Troubleshooting

### PostgreSQL connection error

Make sure Docker is running and PostgreSQL is started:

```bash
docker-compose ps
```

If not running, start it:

```bash
docker-compose up -d
```

### Port 3000 already in use

Change the `PORT` in your `.env` file:

```env
PORT=3001
```

### Migration errors

Reset the database and try again:

```bash
docker-compose down -v
docker-compose up -d
pnpm db:migrate
```

## Useful Commands

```bash
# View PostgreSQL logs
docker-compose logs -f

# Stop PostgreSQL
docker-compose down

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Rebuild and restart
pnpm build && pnpm start
```

Happy coding! 🚀