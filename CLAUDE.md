# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server with tests
npm run dev

# Run development server only
npm run dev:rr

# Build production
npm run build

# Lint and format (run before commits)
npm run checks

# Individual checks
npm run lint
npm run typecheck
npm run format:check

# Fix issues
npm run lint:fix
npm run format:fix

# Database operations
npm run db:studio      # Open Prisma Studio
npm run db:reset       # Reset database with migrations

# Testing
npm test               # Run vitest tests
npm run test:e2e       # Run Playwright e2e tests (when available)
```

## Architecture Overview

### Tech Stack

- **Framework**: React Router v7 with file-based routing
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Stytch passwordless authentication (magic links)
- **Vector DB**: Pinecone for document embeddings
- **AI**: LangChain + OpenAI (embeddings and chat)
- **Storage**: AWS S3 for file uploads
- **Styling**: Tailwind CSS with shadcn/ui components

### Core Architecture Patterns

**Authentication Flow**: Email → Magic Link → `/authenticate` → User lookup/creation → Session cookie

**Route Structure**:

- `_auth.tsx` layout wraps all authenticated routes
- Nested routes: `_auth.docs.new/` has actions for file/URL processing
- Route actions handle form submissions with `handleActionIntent` pattern

**Data Models**:

- Users own Sources (documents) and Chats
- Collections group Sources with many-to-many relationships
- Vector storage is user-namespaced (`user_{publicId}`)

**Document Processing Pipeline**:

1. File upload → Text extraction (in-memory)
2. Source record creation with full text
3. LangChain text splitting and OpenAI embedding
4. Vector storage in user-namespaced Pinecone index

### Key Directories

- `app/.server/` - Server-only code (auth, database operations)
- `app/routes/` - React Router v7 routes with loaders/actions
- `app/components/` - Reusable UI components (shadcn/ui based)
- `app/config/` - Configuration constants and validation
- `app/lib/schemas/` - Zod validation schemas
- `prisma/` - Database schema and migrations

### Environment Setup

Copy `.env.example` to `.env` and fill required variables:

- Stytch auth keys (not Clerk - README is outdated)
- OpenAI API key for embeddings/chat
- Pinecone credentials for vector storage
- PostgreSQL database URLs
- AWS S3 credentials for file storage
- Firecrawl API key for web scraping

### Code Conventions

- Use existing Zod schemas for validation
- Server actions use `handleActionIntent` for form routing
- Database operations via Prisma in `.server/` files
- Type imports from `./+types/` route files
- User isolation via ownership models and namespaced vector stores

### Coding Best Practices

- Avoid use of any type and instead try to use more specific types
