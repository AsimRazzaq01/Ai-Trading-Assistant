# 📄 Pages Summary

> **Overview of all pages in the Profit Path application**

This document provides a comprehensive overview of all pages in the Profit Path application, including their purpose, features, and key functionality.

---

## 📋 Table of Contents

- [Public Pages](#public-pages)
- [Authentication Pages](#authentication-pages)
- [Protected Pages](#protected-pages)
- [Page Features Summary](#page-features-summary)

---

## 🌐 Public Pages

### Home Page (`/`)

**Location:** `frontend/src/app/page.tsx`

**Description:**
The landing page of the application featuring an animated hero section with Lottie animations (moon and rocket), call-to-action buttons, and theme toggle.

**Features:**
- Animated hero section with gradient backgrounds
- Dark/Light theme toggle
- Navigation to login and register pages
- Responsive design with motion animations
- Lottie player integration for animations

**Key Components:**
- Theme toggle button
- Animated moon and rocket graphics
- Call-to-action buttons (Get Started, Learn More)

---

## 🔐 Authentication Pages

### Login Page (`/login`)

**Location:** `frontend/src/app/(auth)/login/page.tsx`

**Description:**
User login page with email/username and password authentication, plus OAuth options.

**Features:**
- Email or username login
- Password authentication
- Google OAuth login (with Google logo)
- GitHub OAuth login (with GitHub logo)
- Form validation with error messages
- Link to registration page
- Theme-aware styling

**Key Components:**
- `LoginForm` component
- OAuth buttons with provider logos
- Error handling and validation

**API Endpoints:**
- `POST /api/login` - Login request
- `GET /auth/google/login` - Google OAuth initiation
- `GET /auth/github/login` - GitHub OAuth initiation

---

### Register Page (`/register`)

**Location:** `frontend/src/app/(auth)/register/page.tsx`

**Description:**
New user registration page.

**Features:**
- Email and password registration
- Form validation
- Password strength requirements
- Link to login page
- Theme-aware styling

**Key Components:**
- `RegisterForm` component
- Validation error messages

**API Endpoints:**
- `POST /api/register` - User registration

---

## 🔒 Protected Pages

All protected pages require authentication and are wrapped in the `(protected)` layout which includes:
- Header navigation
- User authentication check
- Floating widget
- Automatic redirect to login if not authenticated

---

### Dashboard (`/dashboard`)

**Location:** `frontend/src/app/(protected)/dashboard/page.tsx`

**Description:**
Main dashboard providing an overview of market data and news.

**Features:**
- Market overview (top gainers/losers)
- Real-time news feed
- Quick access to all features
- Responsive grid layout
- Theme-aware gradient backgrounds

**Key Components:**
- `MarketOverview` component
- `NewsFeed` component

**Data Sources:**
- Market data from Polygon API
- News feed from backend API

---

### Deep Research (`/deep-research`)

**Location:** `frontend/src/app/(protected)/deep-research/page.tsx`  
**Content Component:** `frontend/src/app/(protected)/deep-research/DeepResearchContent.tsx`

**Description:**
Comprehensive stock research page with AI-powered analysis, charts, and detailed reports.

**Features:**
- Stock symbol search (supports company names)
- Interactive price charts (7/30/90 days or custom range)
- AI-powered analysis and insights
- Technical and fundamental analysis
- News integration and summaries
- Trading strategies recommendations
- Confidence scoring
- PDF report generation
- Add to watchlist/pattern trends/my assets
- Pattern detection visualization
- Support/resistance levels
- Risk assessment

**Key Components:**
- Stock search input
- Date range selector (preset or custom)
- Interactive line charts (Recharts)
- AI analysis sections
- News feed integration
- PDF export functionality

**API Endpoints:**
- `POST /api/news-analysis` - AI news analysis
- `GET /api/pattern-trends/{symbol}` - Pattern analysis
- `POST /api/watchlist` - Add to watchlist
- `POST /api/pattern-trends` - Add to pattern trends

**Data Sources:**
- Polygon API for stock data
- OpenAI API for AI analysis
- Backend API for pattern detection

---

### News Brief (`/news-brief`)

**Location:** `frontend/src/app/(protected)/news-brief/page.tsx`

**Description:**
Dedicated page for financial news and market updates.

**Features:**
- Real-time financial news feed
- Breaking news alerts
- Market analysis articles
- Earnings reports
- Economic indicators
- News categorization
- User authentication status display

**Key Components:**
- `NewsFeed` component
- News category cards
- Live news feed section

**Data Sources:**
- Backend news API
- Real-time news updates

---

### Pattern Trends (`/pattern-trends`)

**Location:** `frontend/src/app/(protected)/pattern-trends/page.tsx`

**Description:**
AI-powered pattern recognition and trend analysis for stocks.

**Features:**
- Add stocks for pattern analysis
- Interactive candlestick charts
- AI pattern detection (Head & Shoulders, Triangles, etc.)
- Trend analysis (uptrend/downtrend/sideways)
- Support & resistance level identification
- Pattern alerts and warnings
- Confidence scoring for patterns
- Date range selection (7/30/90 days or custom)
- 1-day intraday view (click on candle for detailed view)
- Pattern visualization on charts
- Pattern selection and highlighting

**Key Components:**
- Stock input and management
- `CandlestickChart` component
- Pattern analysis display
- Trend indicators
- Support/resistance levels

**API Endpoints:**
- `GET /api/pattern-trends` - Get user's tracked symbols
- `POST /api/pattern-trends` - Add symbol to track
- `DELETE /api/pattern-trends/{symbol}` - Remove symbol
- `POST /api/pattern-detection` - Pattern analysis

**Data Sources:**
- Polygon API for candlestick data
- Backend pattern detection algorithm

**Special Features:**
- Click on a daily candle to view intraday 5-minute bars for that day
- Pattern indices mapped to chart for visualization
- Pattern confidence levels (high/medium/low)

---

### My Watchlist (`/watchlist`)

**Location:** `frontend/src/app/(protected)/watchlist/page.tsx`

**Description:**
Personal watchlist for tracking favorite stocks with real-time price updates.

**Features:**
- Add/remove stocks from watchlist
- Real-time price updates
- Price change tracking (percentage)
- Stock name and symbol display
- Refresh prices button
- Stock symbol or company name search
- Table view with sortable columns
- Color-coded price changes (green/red)

**Key Components:**
- Watchlist table
- Add stock input
- Refresh functionality

**API Endpoints:**
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add symbol to watchlist
- `DELETE /api/watchlist/{symbol}` - Remove symbol

**Data Sources:**
- Backend watchlist API
- Polygon API for real-time prices

**Storage:**
- Backend database (persistent)
- Syncs across devices

---

### My Assets (`/my-assets`)

**Location:** `frontend/src/app/(protected)/my-assets/page.tsx`

**Description:**
AI-enhanced asset dashboard for tracking and analyzing personal stock holdings.

**Features:**
- Add stocks to personal asset dashboard
- Interactive price charts (7/30/90 days or custom range)
- AI-powered insights and summaries
- AI stock recommendations (Buy/Hold/Sell)
- AI news summaries
- Multi-stock comparison tool
- Refresh all assets
- Remove assets
- User-specific localStorage storage
- Expandable text for long AI responses
- Toast notifications

**Key Components:**
- Asset cards with charts
- AI insight sections
- Comparison tool
- Date range selector

**Data Sources:**
- Polygon API for stock data
- OpenAI API for AI analysis
- LocalStorage for user-specific data

**Storage:**
- LocalStorage (user-specific keys)
- Not synced to backend (local only)

**Special Features:**
- AI stock comparison (select 2+ stocks)
- Expandable AI text sections
- Toast notification system
- Custom date range support

---

### Risk Management (`/risk-management`)

**Location:** `frontend/src/app/(protected)/risk-management/page.tsx`

**Description:**
Portfolio risk analysis and management tools with position-level tracking.

**Features:**
- Portfolio risk metrics (total value, position count, risk score)
- Max drawdown calculation
- Sharpe ratio calculation
- Position size limits configuration
- Stop loss and take profit settings
- Position-level risk analysis
- Share amount tracking (supports partial shares)
- Risk alerts and warnings
- Dynamic risk scoring (Low/Medium/High)
- Position value calculations
- Portfolio percentage tracking
- Risk level indicators per position

**Key Components:**
- Risk metrics dashboard
- Position limits configuration
- Position analysis table
- Risk alerts section

**API Endpoints:**
- `GET /api/risk-management` - Get risk settings
- `PUT /api/risk-management` - Update risk settings

**Data Sources:**
- Assets from "My Assets" page (localStorage)
- Backend risk settings API

**Storage:**
- Risk settings: Backend database
- Share amounts: LocalStorage (user-specific)

**Special Features:**
- Calculates portfolio value from share amounts × prices
- Position-level risk warnings
- Concentration risk alerts
- Drawdown monitoring

---

### Market Chat (`/market-chat`)

**Location:** `frontend/src/app/(protected)/market-chat/page.tsx`

**Description:**
AI-powered chat assistant for market insights and trading advice.

**Features:**
- Interactive chat interface
- AI-powered responses
- Chat history persistence
- Real-time message display
- Loading indicators
- Welcome message
- Message timestamps
- Auto-scroll to latest message
- Error handling

**Key Components:**
- Chat message display
- Input form
- Message bubbles (user/assistant)

**API Endpoints:**
- `GET /api/market-chat` - Get chat history
- `POST /api/market-chat` - Send message

**Data Sources:**
- Backend chat API
- OpenAI API for responses

**Storage:**
- Backend database (persistent chat history)
- Messages tied to user account

**Special Features:**
- Persistent chat history across sessions
- Context-aware AI responses
- Market-focused conversation

---

### Settings (`/settings`)

**Location:** `frontend/src/app/(protected)/settings/page.tsx`

**Description:**
User account settings and password management.

**Features:**
- Account information display (email, user ID)
- Change password functionality
- Password visibility toggle
- Form validation
- Success/error messages
- Current password verification
- Password strength requirements

**Key Components:**
- Account information section
- Password change form
- Password visibility toggles

**API Endpoints:**
- `GET /api/me` - Get user information
- `POST /api/change-password` - Change password

**Security Features:**
- Old password verification required
- Password confirmation matching
- Minimum password length (6 characters)
- Secure password input fields

---

## 📊 Page Features Summary

### Common Features Across Pages

1. **Theme Support:**
   - All pages support dark/light themes
   - Theme-aware color schemes
   - Smooth theme transitions

2. **Authentication:**
   - Protected pages require authentication
   - Automatic redirect to login if not authenticated
   - User information display

3. **Responsive Design:**
   - Mobile-friendly layouts
   - Responsive grids and tables
   - Adaptive component sizing

4. **Error Handling:**
   - User-friendly error messages
   - Loading states
   - Network error handling

5. **Data Persistence:**
   - Backend database for persistent data
   - LocalStorage for user preferences
   - Real-time data updates

### Page Categories

**Market Data Pages:**
- Dashboard
- News Brief
- Pattern Trends
- My Watchlist

**Analysis Pages:**
- Deep Research
- My Assets
- Risk Management

**Interactive Pages:**
- Market Chat
- Settings

**Authentication Pages:**
- Login
- Register

---

## 🔗 Navigation Flow

```
Home (/) 
  ├─→ Login (/login)
  │     └─→ Dashboard (/dashboard)
  │
  └─→ Register (/register)
        └─→ Dashboard (/dashboard)

Dashboard (/dashboard)
  ├─→ Deep Research (/deep-research)
  ├─→ News Brief (/news-brief)
  ├─→ Pattern Trends (/pattern-trends)
  ├─→ My Watchlist (/watchlist)
  ├─→ My Assets (/my-assets)
  ├─→ Risk Management (/risk-management)
  ├─→ Market Chat (/market-chat)
  └─→ Settings (/settings)
```

---

## 🎨 Design Patterns

### Layout Structure

**Protected Pages:**
- Header navigation (from layout)
- Main content area
- Floating widget (from layout)
- Theme-aware backgrounds

**Public Pages:**
- Full-page layouts
- Hero sections
- Call-to-action buttons

### Component Reusability

Common reusable components:
- `MarketOverview` - Used in Dashboard
- `NewsFeed` - Used in Dashboard and News Brief
- `CandlestickChart` - Used in Pattern Trends
- Form components (Input, Button) - Used across all forms
- Theme context - Used throughout application

---

## 📱 Responsive Breakpoints

All pages are responsive with:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🔄 Data Flow

### Typical Page Data Flow

1. **Page Load:**
   - Check authentication (protected pages)
   - Fetch user data
   - Load initial data from API

2. **User Interaction:**
   - Form submission
   - API request
   - State update
   - UI refresh

3. **Real-time Updates:**
   - Polling for market data
   - WebSocket connections (if implemented)
   - Manual refresh buttons

---

## 🛠️ Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Recharts (for charts)
- Framer Motion (for animations)
- Lucide React (for icons)

**Backend Integration:**
- RESTful API calls
- Cookie-based authentication
- Error handling
- Loading states

---

## 📝 Notes

- All protected pages automatically redirect to `/login` if user is not authenticated
- Theme preferences are stored in localStorage
- User-specific data is stored in backend database
- Some pages use localStorage for temporary data (My Assets, Risk Management shares)
- All API calls go through Next.js API routes for security and cookie forwarding

---

**Last Updated:** 2024  
**Version:** 1.0

