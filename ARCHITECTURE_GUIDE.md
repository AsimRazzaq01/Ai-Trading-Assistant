# Architecture Guide: Next.js + FastAPI + PostgreSQL

## 🏗️ Current Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Next.js       │         │   FastAPI       │         │   PostgreSQL    │
│   (Vercel)      │◄───────►│   (Railway)     │◄───────►│   (Railway)     │
│   Frontend      │  HTTP   │   Backend       │  SQL    │   Database      │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

**Your Setup:**
- **Frontend**: Next.js on Vercel (serverless)
- **Backend**: Python/FastAPI on Railway
- **Database**: PostgreSQL on Railway
- **Communication**: HTTP/REST API with cookie-based auth

---

## ✅ Architecture Strengths

### 1. **Separation of Concerns** ✅
- Frontend handles UI/UX
- Backend handles business logic & data
- Database handles persistence
- **Benefit**: Easy to scale, maintain, and test each layer independently

### 2. **Technology Flexibility** ✅
- Can use best tool for each job
- Python backend great for ML/AI features (trading algorithms)
- Next.js great for modern React UI
- **Benefit**: Use specialized tools without compromise

### 3. **Independent Scaling** ✅
- Scale frontend (Vercel) separately from backend (Railway)
- Database can be scaled independently
- **Benefit**: Cost-effective scaling based on actual needs

### 4. **Deployment Flexibility** ✅
- Frontend and backend deploy independently
- Can update one without affecting the other
- **Benefit**: Faster iteration and deployment

---

## ⚠️ Potential Issues & Solutions

### 1. **CORS Configuration** ⚠️

**Issue**: Cross-origin requests between Vercel and Railway need proper CORS setup.

**Current Status**: ✅ Already handled correctly
- Backend has `ALLOWED_ORIGINS` with Vercel URL
- `allow_credentials=True` for cookies
- Proper headers configured

**When Adding Features:**
```python
# backend/app/core/config.py
ALLOWED_ORIGINS: str = "https://ai-trading-assistant-steel.vercel.app,http://localhost:3000"
```

**Action**: Always add new frontend domains to `ALLOWED_ORIGINS` in Railway.

---

### 2. **Cookie/Session Management** ⚠️

**Issue**: Cross-origin cookies need special handling.

**Current Status**: ✅ Properly configured
- Production: `SameSite=None; Secure=True` (no domain)
- Local: `SameSite=Lax; Secure=False`

**When Adding Features:**
- ✅ **DO**: Use existing cookie forwarding pattern in API routes
- ✅ **DO**: Keep `HttpOnly` cookies for security
- ❌ **DON'T**: Try to access cookies from client-side JavaScript
- ❌ **DON'T**: Set cookie domain for cross-origin scenarios

**Pattern to Follow:**
```typescript
// frontend/src/app/api/your-new-route/route.ts
const response = await fetch(`${backend}/your-endpoint`, {
    credentials: "include", // Important!
});

// Forward cookies
const setCookie = response.headers.get("set-cookie");
if (setCookie) {
    nextRes.headers.set("set-cookie", setCookie);
}
```

---

### 3. **Environment Variables** ⚠️

**Issue**: Different environments need different backend URLs.

**Current Status**: ✅ Pattern established
```typescript
const backend =
    process.env.API_URL_INTERNAL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
    "http://localhost:8000";
```

**When Adding Features:**
- ✅ **ALWAYS** use this pattern for backend URL
- ✅ Set environment variables in both Vercel and Railway
- ✅ Document new env vars in README

**Required Vercel Variables:**
```bash
NEXT_PUBLIC_API_URL_BROWSER=https://profitpath-api-production.up.railway.app
API_URL_INTERNAL=https://profitpath-api-production.up.railway.app
```

---

### 4. **Error Handling** ⚠️

**Issue**: Network failures between services need graceful handling.

**Current Pattern**: ✅ Good error handling in place
```typescript
try {
    const response = await fetch(`${backend}/endpoint`);
    if (!response.ok) {
        // Handle error
    }
} catch (err) {
    // Handle network error
}
```

**When Adding Features:**
- ✅ Always wrap fetch calls in try-catch
- ✅ Check `response.ok` before parsing JSON
- ✅ Provide user-friendly error messages
- ✅ Log errors for debugging

---

### 5. **Authentication Flow** ⚠️

**Issue**: Auth state needs to be consistent across frontend/backend.

**Current Status**: ✅ Working correctly
- JWT tokens in HttpOnly cookies
- Server components read cookies directly
- Client components use `/api/me` proxy

**When Adding Protected Features:**

**Server Components** (like protected layout):
```typescript
// ✅ Direct backend call
const token = cookieStore.get("access_token")?.value;
const res = await fetch(`${backend}/protected-endpoint`, {
    headers: { Authorization: `Bearer ${token}` },
});
```

**Client Components** (like dashboard):
```typescript
// ✅ Use API proxy route
const res = await fetch("/api/your-endpoint", {
    credentials: "include",
});
```

**New Protected API Route:**
```typescript
// frontend/src/app/api/your-endpoint/route.ts
export async function GET(req: NextRequest) {
    const backend = process.env.API_URL_INTERNAL || ...;
    const cookie = req.headers.get("cookie") ?? "";
    
    const response = await fetch(`${backend}/your-endpoint`, {
        headers: { Cookie: cookie },
        credentials: "include",
    });
    
    // Forward cookies
    const nextRes = NextResponse.json(data);
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);
    
    return nextRes;
}
```

---

## 🚀 Best Practices for Adding Features

### 1. **Adding a New Backend Endpoint**

**Step 1**: Create router in backend
```python
# backend/app/api/your_router.py
from fastapi import APIRouter, Depends
from app.api.deps import get_current_user  # Use existing auth dependency

router = APIRouter()

@router.get("/your-endpoint")
def your_endpoint(current_user = Depends(get_current_user)):
    return {"data": "your data"}
```

**Step 2**: Register router in main.py
```python
# backend/app/main.py
from app.api.your_router import router as your_router

app.include_router(your_router, prefix="/your-prefix", tags=["Your Tag"])
```

**Step 3**: Create Next.js API proxy route
```typescript
// frontend/src/app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    const backend = 
        process.env.API_URL_INTERNAL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
        "http://localhost:8000";

    const cookie = req.headers.get("cookie") ?? "";

    const response = await fetch(`${backend}/your-prefix/your-endpoint`, {
        headers: { Cookie: cookie },
        credentials: "include",
    });

    const data = await response.json();
    const nextRes = NextResponse.json(data, { status: response.status });
    
    // Forward cookies
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);

    return nextRes;
}
```

**Step 4**: Use in frontend
```typescript
// Client component
const res = await fetch("/api/your-endpoint", {
    credentials: "include",
});

// Server component
const res = await fetch(`${backend}/your-prefix/your-endpoint`, {
    headers: { Authorization: `Bearer ${token}` },
});
```

---

### 2. **Adding a New Protected Page**

**Pattern:**
```typescript
// frontend/src/app/(protected)/your-page/page.tsx
import { cookies } from "next/headers";

export default async function YourPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        redirect("/login");
    }

    // Fetch data from backend
    const backend = process.env.API_URL_INTERNAL || ...;
    const res = await fetch(`${backend}/your-endpoint`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    return <div>{/* Your UI */}</div>;
}
```

---

### 3. **Adding Database Models**

**Step 1**: Create model
```python
# backend/app/db/models.py
class YourModel(Base):
    __tablename__ = "your_table"
    
    id = Column(Integer, primary_key=True)
    # ... your fields
```

**Step 2**: Create schema
```python
# backend/app/schemas/your_schema.py
from pydantic import BaseModel

class YourModelCreate(BaseModel):
    # ... fields

class YourModelResponse(BaseModel):
    # ... fields
```

**Step 3**: Create router with CRUD operations
```python
# backend/app/api/your_router.py
@router.post("/your-model", response_model=YourModelResponse)
def create_your_model(
    data: YourModelCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Create logic
    pass
```

---

## 🔒 Authentication Best Practices

### ✅ DO's

1. **Always use HttpOnly cookies** - Prevents XSS attacks
2. **Use Bearer tokens in Authorization header** - For server-to-server calls
3. **Validate tokens on every request** - Don't trust client state
4. **Use dependency injection** - `Depends(get_current_user)` in FastAPI
5. **Forward cookies in API routes** - Maintain session state

### ❌ DON'Ts

1. **Don't store tokens in localStorage** - Vulnerable to XSS
2. **Don't trust client-side auth state** - Always verify on backend
3. **Don't skip CORS configuration** - Security risk
4. **Don't expose sensitive data in API responses** - Filter on backend
5. **Don't hardcode backend URLs** - Use environment variables

---

## 📊 Scalability Considerations

### Current Architecture Scales Well For:

✅ **Small to Medium Applications** (your current stage)
- Up to 1000s of concurrent users
- Multiple API endpoints
- Real-time features (with WebSocket support)

✅ **AI/ML Features**
- Python backend perfect for trading algorithms
- Can add Celery for background tasks
- Easy to integrate ML models

✅ **Multiple Frontends**
- Can add mobile app using same backend
- Can add admin dashboard
- Backend serves all clients

### When to Consider Changes:

⚠️ **High Traffic** (>10k concurrent users)
- Consider API rate limiting
- Add Redis for caching
- Consider CDN for static assets

⚠️ **Real-time Features** (WebSockets)
- Add WebSocket support to FastAPI
- Consider Socket.io or similar
- May need separate WebSocket server

⚠️ **Complex Background Jobs**
- Add Celery + Redis for task queue
- Separate worker processes
- Monitor job status

---

## 🧪 Testing Strategy

### 1. **Backend Testing**
```python
# backend/tests/test_your_router.py
def test_your_endpoint(client, auth_headers):
    response = client.get("/your-endpoint", headers=auth_headers)
    assert response.status_code == 200
```

### 2. **Frontend Testing**
```typescript
// frontend/__tests__/your-component.test.tsx
test("renders data", async () => {
    // Mock API response
    // Test component
});
```

### 3. **Integration Testing**
- Test full flow: Frontend → API Route → Backend → Database
- Use test database
- Mock external services

---

## 🐛 Common Pitfalls to Avoid

### 1. **Forgetting CORS Updates**
❌ Adding new frontend domain without updating `ALLOWED_ORIGINS`
✅ Always update Railway env vars when adding domains

### 2. **Not Forwarding Cookies**
❌ Creating API route without cookie forwarding
✅ Always forward `Set-Cookie` headers from backend

### 3. **Hardcoding URLs**
❌ `fetch("http://localhost:8000/endpoint")`
✅ Use environment variable pattern

### 4. **Skipping Error Handling**
❌ `const data = await res.json()` without checking `res.ok`
✅ Always check response status and handle errors

### 5. **Mixing Auth Patterns**
❌ Using different auth methods in different places
✅ Stick to cookie-based auth with Bearer token fallback

---

## 📝 Checklist for New Features

When adding a new feature, ensure:

- [ ] Backend endpoint created with proper auth
- [ ] CORS updated if needed
- [ ] Next.js API proxy route created
- [ ] Cookie forwarding implemented
- [ ] Environment variables documented
- [ ] Error handling added
- [ ] Tested in local environment
- [ ] Tested in production
- [ ] Authentication tested
- [ ] Edge cases handled

---

## 🎯 Summary

**Your architecture is SOLID and will scale well!** ✅

**Strengths:**
- ✅ Clean separation of concerns
- ✅ Proper authentication flow
- ✅ Good error handling patterns
- ✅ Environment-aware configuration

**No Issues Expected:**
- ✅ Adding new pages/features
- ✅ Adding new API endpoints
- ✅ Adding database models
- ✅ Scaling to more users

**Just Remember:**
1. Always use the established patterns (cookie forwarding, env vars)
2. Keep CORS updated
3. Test in both local and production
4. Document new environment variables

Your current setup is production-ready and follows best practices! 🚀

