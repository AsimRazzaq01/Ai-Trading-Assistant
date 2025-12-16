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

### 🎨 UI/UX Features
- **Dark/Light Theme** - Full theme support with smooth transitions
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Animated UI** - Framer Motion animations throughout
- **Floating Widget** - Quick access to stock search
- **Disclaimer Modal** - Legal disclaimer for trading information
- **Toast Notifications** - User feedback system
- **Loading States** - Comprehensive loading indicators

### 🔐 Authentication & Security
- Secure JWT-based authentication with HttpOnly cookies
- Session management across local and production environments
- Protected routes with server-side authentication
- Cross-origin cookie support for production deployment
- Password hashing with bcrypt
- Email or username login options

### 📊 Trading Features

#### **Dashboard**
- Market overview with top gainers and losers
- Real-time financial news feed
- Quick access to all features
- Responsive grid layout
- Theme-aware gradient backgrounds

#### **Deep Research** 🔬
- Stock symbol search (supports company names)
- Interactive price charts (7/30/90 days or custom range)
- AI-powered analysis and insights
- Technical and fundamental analysis
- News integration and summaries
- Trading strategies recommendations
- Confidence scoring
- **PDF report generation**
- Add to watchlist/pattern trends/my assets
- Pattern detection visualization
- Support/resistance levels
- Risk assessment

#### **News Brief** 📰
- Real-time financial news feed
- Market-moving events and alerts
- Earnings reports and economic indicators
- Expert analysis and commentary

#### **Pattern Trends** 📈
- Add stocks for pattern analysis
- Interactive candlestick charts
- AI pattern detection (Head & Shoulders, Triangles, etc.)
- Trend analysis (uptrend/downtrend/sideways)
- Support & resistance level identification
- Pattern alerts and warnings
- Confidence scoring for patterns
- Date range selection (7/30/90 days or custom)
- **1-day intraday view** (click on candle for detailed 5-minute bars)
- Pattern visualization on charts
- Pattern selection and highlighting

#### **My Watchlist** 👀
- Track favorite securities
- Real-time price monitoring
- Add/remove symbols
- Price change tracking (percentage)
- Stock name and symbol display
- Refresh prices button
- Stock symbol or company name search
- Table view with sortable columns
- Color-coded price changes (green/red)
- Backend database persistence (syncs across devices)

#### **Risk Management** 🛡️
- Portfolio risk metrics (total value, position count, risk score)
- Max drawdown calculation
- Sharpe ratio calculation
- Position size limits configuration
- Stop loss and take profit settings
- **Position-level risk analysis** with share amount tracking
- Supports partial shares
- Risk alerts and warnings
- Dynamic risk scoring (Low/Medium/High)
- Position value calculations
- Portfolio percentage tracking
- Risk level indicators per position
- Integrates with "My Assets" page data

#### **Market Chat** 💬
- Interactive chat interface
- AI-powered responses (OpenAI integration)
- Chat history persistence (stored in database)
- Real-time message display
- Loading indicators
- Welcome message
- Message timestamps
- Auto-scroll to latest message
- Context-aware AI responses
- Market-focused conversation

#### **My Assets** 💼
- AI-enhanced asset dashboard for tracking personal stock holdings
- Add stocks to personal asset dashboard
- Interactive price charts (7/30/90 days or custom range)
- AI-powered insights and summaries
- AI stock recommendations (Buy/Hold/Sell)
- AI news summaries
- **Multi-stock comparison tool** (select 2+ stocks)
- Refresh all assets
- Remove assets
- User-specific localStorage storage
- Expandable text for long AI responses
- Toast notifications

#### **Settings** ⚙️
- Account information display (email, user ID)
- Change password functionality
- Password visibility toggle
- Form validation
- Success/error messages
- Current password verification
- Password strength requirements

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Libraries**:
  - [Framer Motion](https://www.framer.com/motion/) - Animations
  - [Recharts](https://recharts.org/) - Chart visualizations
  - [Lucide React](https://lucide.dev/) - Icons
  - [Lottie Files](https://lottiefiles.com/) - Animated graphics
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **PDF Generation**: jsPDF with html2canvas
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
- **Database**: PostgreSQL 16
- **Version Control**: Git

### External APIs & Services
- **Polygon.io API** - Real-time stock market data, news, and ticker information
- **OpenAI API** - AI-powered chat, analysis, and insights

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

# Polygon API Key (Required for market data)
NEXT_PUBLIC_POLYGON_API_KEY=your-polygon-api-key-here
POLYGON_API_KEY=your-polygon-api-key-here
```

**Production (Vercel):**
```bash
NEXT_PUBLIC_API_URL_BROWSER=https://your-railway-backend.up.railway.app
API_URL_INTERNAL=https://your-railway-backend.up.railway.app
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app

# Polygon API Key (Required for market data)
NEXT_PUBLIC_POLYGON_API_KEY=your-polygon-api-key-here
POLYGON_API_KEY=your-polygon-api-key-here
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

# OpenAI API (Required for Market Chat and AI analysis features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Polygon API Key (Required for market data - optional, can be set in frontend)
# POLYGON_API_KEY=your-polygon-api-key-here

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

# OpenAI API (Required for Market Chat and AI analysis features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Polygon API Key (Optional - can be set in frontend instead)
# POLYGON_API_KEY=your-polygon-api-key-here
```

---

## 📁 Project Structure

```
Ai-Trading-Assistant/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   ├── auth_router.py      # Authentication
│   │   │   ├── trades_router.py    # Trading endpoints
│   │   │   ├── chat_router.py       # OpenAI chat integration
│   │   │   ├── watchlist_router.py  # Watchlist management
│   │   │   ├── pattern_trends_router.py  # Pattern detection
│   │   │   ├── risk_management_router.py  # Risk settings
│   │   │   ├── debug_router.py      # Debug endpoints
│   │   │   └── deps.py             # Dependencies (auth, etc.)
│   │   ├── core/           # Core configuration
│   │   │   ├── config.py   # Settings and environment
│   │   │   ├── security.py # JWT, password hashing
│   │   │   └── utils.py    # Utility functions
│   │   ├── db/             # Database models and connection
│   │   │   ├── models.py    # SQLAlchemy models
│   │   │   └── database.py # Database connection
│   │   ├── schemas/        # Pydantic schemas
│   │   │   ├── user.py
│   │   │   ├── token.py
│   │   │   ├── watchlist.py
│   │   │   ├── pattern_trends.py
│   │   │   └── risk_management.py
│   │   └── main.py         # FastAPI app entry point
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pyrightconfig.json
│
├── frontend/                # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/     # Auth pages (login, register)
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (protected)/ # Protected pages
│   │   │   │   ├── dashboard/
│   │   │   │   ├── deep-research/
│   │   │   │   │   └── DeepResearchContent.tsx
│   │   │   │   ├── news-brief/
│   │   │   │   ├── pattern-trends/
│   │   │   │   ├── watchlist/
│   │   │   │   ├── my-assets/
│   │   │   │   ├── risk-management/
│   │   │   │   ├── market-chat/
│   │   │   │   └── settings/
│   │   │   ├── api/        # Next.js API routes (proxies)
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── me/
│   │   │   │   ├── logout/
│   │   │   │   ├── change-password/
│   │   │   │   ├── watchlist/
│   │   │   │   ├── market-chat/
│   │   │   │   ├── pattern-trends/
│   │   │   │   ├── pattern-detection/
│   │   │   │   ├── risk-management/
│   │   │   │   ├── news/
│   │   │   │   ├── news-analysis/
│   │   │   │   ├── market/
│   │   │   │   ├── quote/
│   │   │   │   └── accept-disclaimer/
│   │   │   ├── layout.tsx  # Root layout
│   │   │   └── page.tsx    # Home page
│   │   ├── components/     # React components
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── LogoutButton.tsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── PasswordInput.tsx
│   │   │   │   └── LottiePlayer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── FloatingWidget.tsx
│   │   │   ├── MarketOverview.tsx
│   │   │   ├── NewsFeed.tsx
│   │   │   ├── NewsAnalysisModal.tsx
│   │   │   ├── CandlestickChart.tsx
│   │   │   ├── StockChartVisualization.tsx
│   │   │   ├── StockSearchAutocomplete.tsx
│   │   │   └── DisclaimerModal.tsx
│   │   ├── context/
│   │   │   └── ThemeContext.tsx  # Dark/Light theme
│   │   └── lib/           # Utilities and hooks
│   │       ├── api/
│   │       │   ├── axios-instance.ts
│   │       │   └── get-backend-url.ts
│   │       ├── hooks/
│   │       │   └── useAuth.ts
│   │       ├── validation/
│   │       │   └── auth-schemas.ts
│   │       ├── fetchStockData.ts
│   │       ├── fetchStockSummary.ts
│   │       ├── searchStock.ts
│   │       ├── marketStatus.ts
│   │       └── utils.ts
│   ├── public/             # Static assets
│   │   └── sunny.json      # Lottie animation
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   ├── biome.json
│   └── vercel.json
│
├── db/                     # Database initialization
│   ├── init.sql
│   └── migrate_email_nullable.sql
│
├── docker-compose.yml      # Docker Compose configuration
├── README.md
├── ARCHITECTURE_GUIDE.md   # Detailed architecture documentation
├── QUICK_REFERENCE.md      # Quick reference for adding features
└── NEW_PAGES_SUMMARY.md    # Overview of all pages
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
- [ ] **Set `OPENAI_API_KEY`** for AI features (Market Chat, Deep Research, My Assets)
- [ ] **Set `POLYGON_API_KEY`** in frontend (Vercel) for market data
- [ ] Test authentication flow
- [ ] Verify cookie forwarding
- [ ] Verify market data is loading correctly

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
- **[NEW_PAGES_SUMMARY.md](./NEW_PAGES_SUMMARY.md)** - Overview of all pages and features

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
- **Polygon.io** - Market data API
- **OpenAI** - AI-powered insights and chat
- **Framer Motion** - Animation library
- **Recharts** - Chart visualization library
- **Lottie Files** - Animated graphics

---

## 📞 Support

For issues or questions:
- Check the [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md) for detailed information
- Review [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for common patterns
- Check application logs for debugging

---

**Built with ❤️ for traders who want to make data-driven decisions**
