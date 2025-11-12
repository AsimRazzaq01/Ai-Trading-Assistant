# Quick Reference: Adding New Features

## 🚀 Template: New Protected API Endpoint

### Backend (FastAPI)

```python
# backend/app/api/your_router.py
from fastapi import APIRouter, Depends
from app.api.deps import get_current_user  # Create if doesn't exist
from app.db.database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/your-endpoint")
def your_endpoint(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Your logic here
    return {"message": "success", "user_id": current_user.id}
```

```python
# backend/app/main.py - Add this line
from app.api.your_router import router as your_router
app.include_router(your_router, prefix="/your-prefix", tags=["Your Tag"])
```

### Frontend API Proxy Route

```typescript
// frontend/src/app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        const backend =
            process.env.API_URL_INTERNAL?.trim() ||
            process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
            "http://localhost:8000";

        const cookie = req.headers.get("cookie") ?? "";

        const response = await fetch(`${backend}/your-prefix/your-endpoint`, {
            method: "GET",
            headers: {
                Cookie: cookie,
            },
            credentials: "include",
            cache: "no-store",
        });

        const data = await response.json().catch(async () => ({
            message: await response.text(),
        }));

        const nextRes = NextResponse.json(data, { status: response.status });

        // ✅ Forward cookies
        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
            nextRes.headers.set("set-cookie", setCookie);
        }

        return nextRes;
    } catch (err) {
        console.error("❌ API error:", err);
        return NextResponse.json(
            { detail: "Request failed" },
            { status: 500 }
        );
    }
}
```

### Use in Client Component

```typescript
// frontend/src/components/YourComponent.tsx
"use client";

export default function YourComponent() {
    const fetchData = async () => {
        const res = await fetch("/api/your-endpoint", {
            credentials: "include",
        });
        const data = await res.json();
        // Use data
    };
}
```

### Use in Server Component

```typescript
// frontend/src/app/(protected)/your-page/page.tsx
import { cookies } from "next/headers";

export default async function YourPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        redirect("/login");
    }

    const backend =
        process.env.API_URL_INTERNAL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
        "http://localhost:8000";

    const res = await fetch(`${backend}/your-prefix/your-endpoint`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Cookie: `access_token=${token}`,
        },
        cache: "no-store",
    });

    const data = await res.json();
    return <div>{/* Your UI */}</div>;
}
```

---

## 🔐 Template: Auth Dependency (if needed)

```python
# backend/app/api/deps.py
from fastapi import Depends, HTTPException, Cookie, Header
from jose import jwt, JWTError
from app.core.config import settings
from app.db.database import get_db
from app.db import models
from sqlalchemy.orm import Session

def get_current_user(
    authorization: str = Header(None),
    access_token: str = Cookie(None),
    db: Session = Depends(get_db)
):
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]
    elif access_token:
        token = access_token

    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user
```

---

## 📋 Environment Variables Checklist

### Vercel (Frontend)
```bash
NEXT_PUBLIC_API_URL_BROWSER=https://profitpath-api-production.up.railway.app
API_URL_INTERNAL=https://profitpath-api-production.up.railway.app
```

### Railway (Backend)
```bash
ENV=production
ALLOWED_ORIGINS=https://ai-trading-assistant-steel.vercel.app,http://localhost:3000
COOKIE_SECURE=True
COOKIE_SAMESITE=none
DATABASE_URL=your_postgres_url
JWT_SECRET_KEY=your_secret_key
```

---

## ✅ Quick Checklist

- [ ] Backend endpoint created
- [ ] Router registered in main.py
- [ ] Frontend API proxy route created
- [ ] Cookie forwarding implemented
- [ ] Error handling added
- [ ] Tested locally
- [ ] Environment variables set
- [ ] CORS updated if new domain

