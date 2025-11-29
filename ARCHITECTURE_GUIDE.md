# 🏗️ Architecture Guide

> **Comprehensive Architecture Documentation for Profit Path**

This document provides a detailed overview of the Profit Path application architecture, including system design, component interactions, data flow, and deployment strategies.

---

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Authentication & Security](#authentication--security)
- [Database Schema](#database-schema)
- [API Design](#api-design)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Environment Configuration](#environment-configuration)

---

## 🎯 System Overview

Profit Path is a **full-stack microservices application** built with modern web technologies:

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Backend**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 16
- **Deployment**: Vercel (Frontend) + Railway (Backend + Database)

### Key Architectural Principles

1. **Separation of Concerns**: Clear boundaries between frontend, backend, and database
2. **API-First Design**: RESTful API with clear contracts
3. **Security-First**: JWT-based authentication with HttpOnly cookies
4. **Environment-Aware**: Seamless operation in local and production environments
5. **Scalable**: Each service can be scaled independently

---

## 🏛️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  (Next.js App - Vercel Production / Localhost:3000)          │
└───────────────────────┬─────────────────────────────────────┘
                         │
                         │ HTTPS/HTTP
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────┐            ┌─────────────────┐
│   Next.js       │            │   FastAPI       │
│   Frontend      │◄───────────►│   Backend       │
│   (Vercel)      │   HTTP      │   (Railway)     │
│                 │   REST API  │                 │
│  - React        │             │  - Python 3.11+ │
│  - TypeScript   │             │  - FastAPI      │
│  - Tailwind CSS │             │  - SQLAlchemy    │
└─────────────────┘            └────────┬─────────┘
                                        │
                                        │ SQL
                                        │
                                        ▼
                              ┌─────────────────┐
                              │   PostgreSQL    │
                              │   Database      │
                              │   (Railway)     │
                              └─────────────────┘
```

---

## 🧩 Component Architecture

### Frontend Components

```
frontend/src/
├── app/
│   ├── (auth)/              # Public routes (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (protected)/         # Protected routes (require auth)
│   │   ├── dashboard/
│   │   ├── deep-research/
│   │   ├── news-brief/
│   │   ├── pattern-trends/
│   │   ├── watchlist/
│   │   ├── risk-management/
│   │   ├── market-chat/
│   │   └── settings/
│   └── api/                 # Next.js API routes (proxies to backend)
│       ├── login/
│       ├── register/
│       ├── me/
│       └── ...
├── components/              # Reusable React components
│   ├── auth/
│   ├── ui/
│   └── ...
├── context/                 # React context providers
│   └── ThemeContext.tsx
└── lib/                     # Utilities and helpers
    ├── api/
    └── hooks/
```

### Backend Components

```
backend/app/
├── api/                    # API route handlers
│   ├── auth_router.py      # Authentication endpoints
│   ├── watchlist_router.py
│   ├── chat_router.py      # OpenAI integration
│   ├── pattern_trends_router.py
│   ├── risk_management_router.py
│   └── deps.py             # Dependency injection
├── core/                   # Core configuration
│   ├── config.py           # Settings and environment
│   └── security.py         # JWT, password hashing
├── db/                     # Database layer
│   ├── models.py           # SQLAlchemy models
│   └── database.py         # Database connection
├── schemas/                # Pydantic schemas
└── main.py                 # FastAPI app entry point
```

---

## 🔄 Data Flow

### Authentication Flow

```
1. User submits login form
   ↓
2. Frontend → Next.js API route (/api/login)
   ↓
3. Next.js API → FastAPI backend (/auth/login)
   ↓
4. Backend validates credentials
   ↓
5. Backend generates JWT token
   ↓
6. Backend sets HttpOnly cookie
   ↓
7. Cookie forwarded to browser via Next.js
   ↓
8. User authenticated for subsequent requests
```

### Protected Route Access

```
1. User navigates to protected route
   ↓
2. Next.js layout checks for cookie
   ↓
3. Server-side fetch to /auth/me with cookie
   ↓
4. Backend validates JWT from cookie
   ↓
5. Returns user data if valid
   ↓
6. Layout renders protected content
   ↓
7. If invalid → redirect to /login
```

### API Request Flow

```
1. Client component makes request
   ↓
2. Next.js API route (/api/endpoint)
   ↓
3. API route forwards to FastAPI backend
   ↓
4. Backend validates authentication (cookie)
   ↓
5. Backend processes request
   ↓
6. Backend queries/updates database
   ↓
7. Response returned to Next.js API route
   ↓
8. Next.js API route returns to client
```

---

## 🔐 Authentication & Security

### JWT Token Structure

```json
{
  "sub": "user_id",
  "exp": 1234567890
}
```

### Cookie Configuration

**Local Development:**
- `Secure: False` (HTTP allowed)
- `SameSite: Lax`
- `HttpOnly: True`
- `Domain: None`

**Production:**
- `Secure: True` (HTTPS only)
- `SameSite: None` (cross-origin)
- `HttpOnly: True`
- `Domain: None` (browser handles cross-origin)

### OAuth Flow

1. User clicks "Continue with Google/GitHub"
2. Redirect to backend OAuth endpoint
3. Backend redirects to OAuth provider
4. User authorizes on provider
5. Provider redirects back to backend callback
6. Backend exchanges code for token
7. Backend fetches user info
8. Backend creates/updates user in database
9. Backend sets authentication cookie
10. Redirect to frontend dashboard

---

## 🗄️ Database Schema

### Core Tables

**users**
- `id` (PK)
- `email` (unique, indexed)
- `username` (unique, indexed, nullable)
- `hashed_password`
- `provider` (local | google | github)
- `provider_id` (OAuth provider ID)
- `created_at`

**watchlist_items**
- `id` (PK)
- `user_id` (FK → users.id)
- `symbol` (indexed)
- `created_at`

**chat_messages**
- `id` (PK)
- `user_id` (FK → users.id)
- `role` (user | assistant)
- `content`
- `created_at` (indexed)

**pattern_trends_items**
- `id` (PK)
- `user_id` (FK → users.id)
- `symbol` (indexed)
- `created_at`

**risk_settings**
- `id` (PK)
- `user_id` (FK → users.id, unique)
- `max_position_size`
- `stop_loss`
- `take_profit`
- `updated_at`

### Relationships

- `User` → `WatchlistItem` (one-to-many)
- `User` → `ChatMessage` (one-to-many)
- `User` → `PatternTrendsItem` (one-to-many)
- `User` → `RiskSettings` (one-to-one)

---

## 🌐 API Design

### RESTful Endpoints

**Authentication:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `POST /auth/change-password` - Change password
- `GET /auth/google/login` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/github/login` - Initiate GitHub OAuth
- `GET /auth/github/callback` - GitHub OAuth callback

**Watchlist:**
- `GET /watchlist` - Get user's watchlist
- `POST /watchlist` - Add symbol to watchlist
- `DELETE /watchlist/{symbol}` - Remove symbol

**Chat:**
- `GET /chat/messages` - Get chat history
- `POST /chat/message` - Send message to AI

**Pattern Trends:**
- `GET /pattern-trends` - Get user's tracked symbols
- `POST /pattern-trends` - Add symbol to track
- `GET /pattern-trends/{symbol}` - Get pattern analysis

**Risk Management:**
- `GET /risk-management` - Get risk settings
- `POST /risk-management` - Update risk settings

### Response Format

**Success:**
```json
{
  "message": "Success message",
  "data": { ... }
}
```

**Error:**
```json
{
  "detail": "Error message"
}
```

---

## 💻 Frontend Architecture

### Next.js App Router Structure

**Route Groups:**
- `(auth)` - Public routes (no authentication required)
- `(protected)` - Protected routes (authentication required)

**Layout Hierarchy:**
```
app/layout.tsx (root)
├── (auth)/layout.tsx
│   └── login/page.tsx
│   └── register/page.tsx
└── (protected)/layout.tsx
    ├── dashboard/page.tsx
    ├── deep-research/page.tsx
    └── ...
```

### Server vs Client Components

**Server Components (default):**
- Layouts
- Pages that fetch data
- Components that don't need interactivity

**Client Components (`"use client"`):**
- Forms
- Interactive UI elements
- Components using hooks

### State Management

- **Server State**: Fetched in server components
- **Client State**: React hooks (useState, useForm)
- **Theme State**: Context API (ThemeContext)
- **Auth State**: Cookies (server-side validation)

---

## ⚙️ Backend Architecture

### FastAPI Application Structure

**Router Pattern:**
- Each feature has its own router
- Routers are included in `main.py`
- Dependencies injected via FastAPI's `Depends()`

**Dependency Injection:**
- `get_db()` - Database session
- `get_current_user_from_cookie()` - Authentication
- `get_oauth()` - OAuth instance

### Error Handling

**HTTP Exceptions:**
```python
raise HTTPException(
    status_code=400,
    detail="Error message"
)
```

**Validation:**
- Pydantic models for request/response validation
- Automatic OpenAPI schema generation

### Database Operations

**SQLAlchemy ORM:**
- Models defined in `models.py`
- Relationships via `relationship()`
- Queries via `db.query()`
- Transactions via `db.commit()`

---

## 🚀 Deployment Architecture

### Production Deployment

**Frontend (Vercel):**
- Automatic deployments on git push
- Edge network for global CDN
- Serverless functions for API routes
- Environment variables in Vercel dashboard

**Backend (Railway):**
- Containerized deployment
- Automatic builds from Dockerfile
- Environment variables in Railway dashboard
- PostgreSQL service provisioned automatically

**Database (Railway):**
- Managed PostgreSQL 16
- Connection string provided as `DATABASE_URL`
- Automatic backups

### Environment Variables

**Frontend (Vercel):**
- `NEXT_PUBLIC_API_URL_BROWSER` - Public backend URL
- `API_URL_INTERNAL` - Internal backend URL (server-side)
- `NEXT_PUBLIC_APP_URL` - Frontend URL

**Backend (Railway):**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET_KEY` - Secret for JWT signing
- `ENV` - Environment (development/production)
- `ALLOWED_ORIGINS` - CORS allowed origins
- `COOKIE_SECURE` - Cookie security flag
- `COOKIE_SAMESITE` - Cookie SameSite policy
- `FRONTEND_URL` - Frontend URL for redirects
- OAuth credentials (Google, GitHub)
- `OPENAI_API_KEY` - OpenAI API key

---

## 🔧 Environment Configuration

### Local Development

**Docker Compose:**
- PostgreSQL container
- FastAPI backend container
- Next.js frontend container
- Shared network for inter-service communication

**Environment Files:**
- `.env` (root) - Shared variables
- `backend/.env` - Backend-specific variables
- `frontend/.env.local` - Frontend-specific variables

### Production

**Environment Variables:**
- Set in deployment platform dashboards
- Never committed to repository
- Different values for local vs production

**Cookie Configuration:**
- Local: `Secure=False`, `SameSite=Lax`
- Production: `Secure=True`, `SameSite=None`

**CORS Configuration:**
- Local: `http://localhost:3000`
- Production: `https://your-vercel-app.vercel.app`

---

## 📊 Performance Considerations

### Frontend
- Server-side rendering for initial load
- Client-side navigation for SPA-like experience
- API route caching where appropriate
- Image optimization via Next.js Image component

### Backend
- Database connection pooling
- Query optimization with indexes
- Lazy loading for relationships
- Response caching for static data

### Database
- Indexed columns for fast lookups
- Foreign key constraints for data integrity
- Timestamp indexes for time-based queries

---

## 🔍 Monitoring & Debugging

### Logging

**Frontend:**
- Console logs in development
- Error boundaries for error handling

**Backend:**
- Print statements for startup
- FastAPI automatic request logging
- Error logging with tracebacks

### Debugging

**Local:**
- FastAPI Swagger UI: `http://localhost:8000/docs`
- Next.js dev tools
- Browser DevTools

**Production:**
- Railway logs
- Vercel logs
- Error tracking (if implemented)

---

## 🛡️ Security Best Practices

1. **Authentication:**
   - HttpOnly cookies prevent XSS
   - JWT tokens expire after 24 hours
   - Password hashing with bcrypt

2. **Authorization:**
   - Server-side validation for all protected routes
   - User-specific data filtered by user_id

3. **CORS:**
   - Whitelist specific origins
   - Credentials allowed only for trusted origins

4. **Input Validation:**
   - Pydantic models validate all inputs
   - SQL injection prevented by ORM

5. **Environment Variables:**
   - Secrets never committed to repository
   - Different keys for dev/prod

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Last Updated:** 2024
**Version:** 1.0

