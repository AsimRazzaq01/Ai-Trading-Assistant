# Profit Path 🚀

> **AI-Powered Trading Assistant** - Your Personal Trading Intelligence Platform

A comprehensive full-stack trading assistant application that combines real-time market data, AI-powered insights, and advanced analytics to help traders make informed decisions.

**Farmingdale State College Senior Project**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Development](#development)
- [Documentation](#documentation)

---

## 🎯 Overview

Profit Path is a modern, AI-powered trading assistant platform designed to provide traders with:

- **Deep Market Research** - Comprehensive analysis and research reports
- **Real-time News** - Latest financial news and market updates
- **Pattern Recognition** - AI-powered pattern detection and trend analysis
- **Portfolio Management** - Watchlist and risk management tools
- **AI Chat Assistant** - Interactive market insights and trading advice

The application follows a microservices architecture with separate frontend and backend services, ensuring scalability, maintainability, and optimal performance.

---

## ✨ Features

### 🔐 Authentication & Security
- Secure JWT-based authentication with HttpOnly cookies
- Session management across local and production environments
- Protected routes with server-side authentication
- Cross-origin cookie support for production deployment

### 📊 Trading Features

#### **Dashboard**
- User overview and portfolio summary
- Quick access to all features
- Real-time connection status

#### **Deep Research** 🔬
- Technical and fundamental analysis
- AI-powered market insights
- Comprehensive research reports
- Pattern analysis and predictions

#### **News Brief** 📰
- Real-time financial news feed
- Market-moving events and alerts
- Earnings reports and economic indicators
- Expert analysis and commentary

#### **Pattern Trends** 📈
- AI-powered pattern recognition
- Chart pattern detection (Head & Shoulders, Triangles, etc.)
- Trend analysis and strength metrics
- Support & resistance level identification
- Real-time pattern alerts

#### **My Watchlist** 👀
- Track favorite securities
- Real-time price monitoring
- Add/remove symbols
- Price change tracking

#### **Risk Management** 🛡️
- Portfolio risk metrics
- Position size limits
- Stop loss and take profit settings
- Risk alerts and warnings
- Sharpe ratio and drawdown analysis

#### **Market Chat** 💬
- AI-powered trading assistant
- Real-time market insights
- Trading strategy advice
- Interactive Q&A interface

#### **Settings** ⚙️
- Account management
- User preferences
- System configuration

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Runtime**: Node.js

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Language**: Python 3.11+
- **Database**: PostgreSQL 16
- **ORM**: SQLAlchemy
- **Authentication**: JWT (python-jose)
- **Deployment**: Railway

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL
- **Version Control**: Git

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
└───────────────────────┬─────────────────────────────────────┘
                         │
                         │ HTTPS
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────┐            ┌─────────────────┐
│   Next.js       │            │   FastAPI       │
│   Frontend      │◄───────────►│   Backend       │
│   (Vercel)      │   HTTP      │   (Railway)     │
│                 │   REST API  │                 │
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

### Architecture Highlights

- **Separation of Concerns**: Frontend, backend, and database are independently scalable
- **API-First Design**: RESTful API with clear separation between client and server
- **Cookie-Based Auth**: Secure HttpOnly cookies with JWT tokens
- **Environment-Aware**: Works seamlessly in local development and production
- **Microservices Ready**: Each service can be scaled independently

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Python** 3.11+
- **Docker** and Docker Compose (for local development)
- **PostgreSQL** (or use Docker Compose)

### Local Development Setup

#### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ai-Trading-Assistant
   ```

2. **Create environment files**
   ```bash
   # Create .env file in root directory
   cp .env.example .env  # If you have an example file
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database on port `5432`
   - FastAPI backend on port `8000`
   - Next.js frontend on port `3000`

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

#### Option 2: Manual Setup

**Backend Setup:**

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (see Environment Variables section)
# Run migrations/create database
# Start the server
uvicorn app.main:app --reload
```

**Frontend Setup:**

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables (see Environment Variables section)
# Start development server
npm run dev
```

---

## 🔐 Environment Variables

### Frontend (Vercel / Local)

Create a `.env.local` file in the `frontend/` directory:

```bash
# Backend API URL (public, accessible from browser)
NEXT_PUBLIC_API_URL_BROWSER=http://localhost:8000

# Internal API URL (for server-side requests)
API_URL_INTERNAL=http://localhost:8000

# App URL (optional, for internal API calls)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Production (Vercel):**
```bash
NEXT_PUBLIC_API_URL_BROWSER=https://your-railway-backend.up.railway.app
API_URL_INTERNAL=https://your-railway-backend.up.railway.app
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```

### Backend (Railway / Local)

Create a `.env` file in the `backend/` directory:

```bash
# Database
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/ai_trading

# JWT
JWT_SECRET_KEY=your-super-secret-key-change-me
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60

# Environment
ENV=development  # or "production"

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Cookies (Local Development)
COOKIE_SECURE=False
COOKIE_SAMESITE=lax
COOKIE_DOMAIN=

# OpenAI API (Required for Market Chat feature)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Cookies (Production)
# COOKIE_SECURE=True
# COOKIE_SAMESITE=none
# COOKIE_DOMAIN=
```

**Production (Railway):**
```bash
ENV=production
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000
COOKIE_SECURE=True
COOKIE_SAMESITE=none
COOKIE_DOMAIN=

# OpenAI API (Required for Market Chat feature)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

---

## 📁 Project Structure

```
Ai-Trading-Assistant/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   ├── auth_router.py
│   │   │   ├── trades_router.py
│   │   │   ├── chat_router.py  # OpenAI chat integration
│   │   │   └── deps.py     # Dependencies (auth, etc.)
│   │   ├── core/           # Core configuration
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db/             # Database models and connection
│   │   │   ├── models.py
│   │   │   └── database.py
│   │   ├── schemas/        # Pydantic schemas
│   │   └── main.py         # FastAPI app entry point
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/     # Auth pages (login, register)
│   │   │   ├── (protected)/ # Protected pages
│   │   │   │   ├── dashboard/
│   │   │   │   ├── deep-research/
│   │   │   │   ├── news-brief/
│   │   │   │   ├── pattern-trends/
│   │   │   │   ├── watchlist/
│   │   │   │   ├── risk-management/
│   │   │   │   ├── market-chat/
│   │   │   │   └── settings/
│   │   │   └── api/        # Next.js API routes (proxies)
│   │   ├── components/     # React components
│   │   └── lib/           # Utilities and hooks
│   ├── Dockerfile
│   ├── package.json
│   └── vercel.json
│
├── db/                     # Database initialization
│   └── init.sql
│
├── docker-compose.yml      # Docker Compose configuration
├── README.md
├── ARCHITECTURE_GUIDE.md   # Detailed architecture documentation
└── QUICK_REFERENCE.md      # Quick reference for adding features
```

---

## 🚢 Deployment

### Production Deployment

#### Frontend (Vercel)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL_BROWSER`
   - `API_URL_INTERNAL`
   - `NEXT_PUBLIC_APP_URL`
3. **Deploy** - Vercel will automatically deploy on push

#### Backend (Railway)

1. **Create a new project** on Railway
2. **Connect your repository** or deploy from GitHub
3. **Set environment variables** in Railway dashboard
4. **Add PostgreSQL service** (Railway can provision this)
5. **Deploy** - Railway will build and deploy automatically

#### Database (Railway)

- Railway can automatically provision PostgreSQL
- Connection string will be provided as `DATABASE_URL`
- Update backend environment variables with the connection string

### Environment-Specific Configuration

**Production Checklist:**
- [ ] Set `ENV=production` in backend
- [ ] Configure `ALLOWED_ORIGINS` with production frontend URL
- [ ] Set `COOKIE_SECURE=True` and `COOKIE_SAMESITE=none`
- [ ] Use strong `JWT_SECRET_KEY`
- [ ] Update CORS settings
- [ ] Test authentication flow
- [ ] Verify cookie forwarding

---

## 💻 Development

### Running Locally

```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

### Development Workflow

1. **Make changes** to frontend or backend code
2. **Hot reload** is enabled (changes reflect automatically)
3. **Test locally** before committing
4. **Commit and push** to trigger deployment

### Adding New Features

See `QUICK_REFERENCE.md` for templates and patterns:
- Adding new API endpoints
- Creating protected pages
- Implementing authentication
- Database models and schemas

### Code Style

- **Frontend**: TypeScript with strict mode, Tailwind CSS
- **Backend**: Python with type hints, FastAPI best practices
- **Formatting**: Follow existing code patterns

---

## 📚 Documentation

### Additional Documentation

- **[ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md)** - Comprehensive architecture guide
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference for common tasks
- **[NEW_PAGES_SUMMARY.md](./NEW_PAGES_SUMMARY.md)** - Overview of all pages
- **[FIXES_APPLIED.md](./FIXES_APPLIED.md)** - Authentication fixes and solutions

### API Documentation

- **Swagger UI**: http://localhost:8000/docs (local)
- **ReDoc**: http://localhost:8000/redoc (local)

---

## 🧪 Testing

### Manual Testing

1. **Authentication Flow**
   - Register new user
   - Login with credentials
   - Verify session persistence
   - Test logout

2. **Protected Routes**
   - Access protected pages
   - Verify redirect to login when unauthorized
   - Test cookie forwarding

3. **API Endpoints**
   - Test all API routes
   - Verify error handling
   - Check response formats

---

## 🤝 Contributing

This is a senior project for Farmingdale State College. For questions or issues, please contact the project maintainer.

---

## 📝 License

This project is part of a senior capstone project at Farmingdale State College.

---

## 🙏 Acknowledgments

- **Next.js** - React framework
- **FastAPI** - Modern Python web framework
- **Vercel** - Frontend hosting platform
- **Railway** - Backend and database hosting
- **Tailwind CSS** - Utility-first CSS framework

---

## 📞 Support

For issues or questions:
- Check the [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md) for detailed information
- Review [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for common patterns
- Check application logs for debugging

---

**Built with ❤️ for traders who want to make data-driven decisions**
