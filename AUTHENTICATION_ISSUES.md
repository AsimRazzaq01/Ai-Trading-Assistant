# Authentication Issues Breakdown

## 🔴 Critical Issues Identified

### 1. **Cookie Forwarding Logic (Local Development Broken)**
**Location**: `frontend/src/app/api/login/route.ts` and `frontend/src/app/api/me/route.ts`

**Problem**: 
- Cookies are only forwarded if they contain `"ai-trading-assistant-steel.vercel.app"`
- This hardcoded check prevents cookies from being forwarded in local development
- Local dev cookies won't work because they don't contain the Vercel domain

**Code Issue**:
```typescript
if (setCookie && setCookie.includes("ai-trading-assistant-steel.vercel.app")) {
    nextRes.headers.set("set-cookie", setCookie);
}
```

**Impact**: 
- ❌ Local development: Cookies never forwarded → Session expires immediately
- ⚠️ Production: Only works if cookie contains exact domain string

---

### 2. **Protected Layout Using Wrong Backend URL**
**Location**: `frontend/src/app/(protected)/layout.tsx`

**Problem**:
- Uses `NODE_ENV === "production"` to determine backend URL
- `NODE_ENV` is always `"production"` in Next.js production builds (even locally)
- Should use `/api/me` proxy route instead of direct backend call
- Doesn't properly forward cookies from client to backend

**Code Issue**:
```typescript
const backend = process.env.NODE_ENV === "production"
    ? process.env.API_URL_INTERNAL || "http://ai_backend:8000"
    : process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";
```

**Impact**:
- ❌ Local dev: May try to use `API_URL_INTERNAL` (Docker internal URL) when running locally
- ❌ Production: May use wrong backend URL
- ❌ Cookies not properly forwarded

---

### 3. **Cookie Domain Configuration Issues**
**Location**: `backend/app/api/auth_router.py`

**Problem**:
- Sets cookie domain to `.vercel.app` in production
- For cross-origin (Vercel frontend → Railway backend), cookies should NOT have a domain set, or domain must match
- Railway backend domain ≠ Vercel frontend domain → cookies won't work

**Code Issue**:
```python
if settings.ENV == "production":
    cookie_kwargs["samesite"] = "none"
    cookie_kwargs["secure"] = True
    cookie_kwargs["domain"] = settings.COOKIE_DOMAIN or ".vercel.app"
```

**Impact**:
- ❌ Production: Cookies set with `.vercel.app` domain won't be sent to Railway backend
- ❌ Cross-origin cookies need no domain or correct domain

---

### 4. **Vercel.json Rewrite Conflict**
**Location**: `frontend/vercel.json`

**Problem**:
- Rewrites `/api/:path*` to Railway backend
- This intercepts Next.js API routes (`/api/login`, `/api/me`, etc.)
- Next.js API routes should handle requests, not be rewritten to backend

**Code Issue**:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://profitpath-api-production.up.railway.app/:path*"
    }
  ]
}
```

**Impact**:
- ❌ All `/api/*` routes bypass Next.js and go directly to Railway
- ❌ Cookie forwarding logic in Next.js API routes never executes
- ❌ Authentication flow breaks completely

---

### 5. **Environment Detection Logic**
**Problem**:
- Multiple places use `NODE_ENV === "production"` which is unreliable
- Should use a custom environment variable or check actual environment
- `NODE_ENV` is set to `"production"` in Next.js builds regardless of actual environment

**Impact**:
- ❌ Wrong backend URLs selected
- ❌ Wrong cookie settings applied
- ❌ Configuration mismatches

---

### 6. **Cookie SameSite/Secure Settings**
**Location**: `backend/app/api/auth_router.py`

**Problem**:
- Production needs `SameSite=None; Secure` for cross-origin
- But domain must be omitted or set correctly
- Current logic may set domain incorrectly

**Impact**:
- ❌ Cross-origin cookies may be rejected by browser
- ❌ Session not maintained between Vercel and Railway

---

## ✅ Solutions Required

### Fix 1: Update Cookie Forwarding Logic
- Forward cookies in ALL environments, not just production
- Remove hardcoded domain check
- Forward cookies based on environment, not domain string

### Fix 2: Fix Protected Layout
- Use `/api/me` proxy route instead of direct backend call
- Properly forward cookies from client
- Fix environment detection

### Fix 3: Fix Cookie Domain Settings
- For cross-origin (Vercel → Railway): Don't set domain, or set it correctly
- For same-origin (local dev): Don't set domain
- Ensure `SameSite=None; Secure` for production cross-origin

### Fix 4: Remove/Fix Vercel.json Rewrite
- Remove the rewrite that intercepts `/api/*` routes
- Or make it more specific to only rewrite non-Next.js routes

### Fix 5: Improve Environment Detection
- Use custom environment variables
- Better logic for local vs production detection

### Fix 6: Ensure Proper Cookie Settings
- Local: `SameSite=Lax; Secure=false` (no domain)
- Production: `SameSite=None; Secure=true` (no domain for cross-origin)

