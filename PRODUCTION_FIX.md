# Production Fix - Session Expired Issue

## 🔴 Issue
Production was working before changes, but now shows "Session expired. Go to Login →" error after fixes.

## ✅ Root Cause
The protected layout was changed to call `/api/me` (internal API route) instead of calling the backend directly. In Vercel's serverless environment, server components making HTTP calls to their own API routes can be unreliable.

## 🔧 Fix Applied

### Changed Files:
1. `frontend/src/app/(protected)/layout.tsx`
2. `frontend/src/app/(protected)/settings/page.tsx`

### Solution:
Reverted to calling the backend **directly** from server components (like the original working code), but with improved environment variable detection:

**Before (broken):**
```typescript
// Tried to call internal API route
const apiUrl = `https://${process.env.VERCEL_URL}/api/me`;
const res = await fetch(apiUrl, {
    headers: { Cookie: `access_token=${token}` },
});
```

**After (fixed):**
```typescript
// Call backend directly (more reliable in serverless)
const backend =
    process.env.API_URL_INTERNAL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
    "http://localhost:8000";

const res = await fetch(`${backend}/auth/me`, {
    headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `access_token=${token}`,
    },
    cache: "no-store",
});
```

## 📋 Required Vercel Environment Variables

Make sure these are set in your Vercel project:

```bash
# Backend API URL (Railway backend)
NEXT_PUBLIC_API_URL_BROWSER=https://profitpath-api-production.up.railway.app

# Optional: Internal URL (same as above for Vercel)
API_URL_INTERNAL=https://profitpath-api-production.up.railway.app
```

## ✅ What Still Works

- ✅ Client-side calls (dashboard page) still use `/api/me` proxy route
- ✅ Login/Register routes still use `/api/login` and `/api/register` proxy routes
- ✅ Cookie forwarding still works for all API routes
- ✅ Local development still works

## 🎯 Architecture

- **Server Components** (protected layout, settings): Call backend directly
- **Client Components** (dashboard): Use `/api/me` proxy route
- **API Routes** (`/api/login`, `/api/me`, etc.): Proxy to backend with cookie forwarding

This hybrid approach ensures:
- Server components have reliable backend access
- Client components benefit from cookie forwarding
- All routes work in both local and production

