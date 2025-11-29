# ⚡ Quick Reference Guide

> **Quick templates and patterns for common development tasks**

This guide provides copy-paste templates and patterns for quickly adding features, endpoints, and components to the Profit Path application.

---

## 📋 Table of Contents

- [Adding a New API Endpoint](#adding-a-new-api-endpoint)
- [Creating a Protected Page](#creating-a-protected-page)
- [Adding a Database Model](#adding-a-database-model)
- [Creating a Pydantic Schema](#creating-a-pydantic-schema)
- [Adding Authentication to Endpoint](#adding-authentication-to-endpoint)
- [Creating a Next.js API Route](#creating-a-nextjs-api-route)
- [Adding a React Component](#adding-a-react-component)
- [Database Query Patterns](#database-query-patterns)
- [Error Handling Patterns](#error-handling-patterns)
- [Common Code Snippets](#common-code-snippets)

---

## 🔌 Adding a New API Endpoint

### Backend Router Template

```python
# backend/app/api/your_router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.api.deps import get_current_user_from_cookie
from app.db import models

router = APIRouter()

# Request/Response Models
class YourRequest(BaseModel):
    field1: str
    field2: int

class YourResponse(BaseModel):
    id: int
    field1: str
    field2: int

# GET Endpoint
@router.get("/your-endpoint")
def get_your_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_cookie),
):
    """Get user's data."""
    # Your logic here
    data = db.query(models.YourModel).filter(
        models.YourModel.user_id == current_user.id
    ).all()
    
    return {"data": data}

# POST Endpoint
@router.post("/your-endpoint", response_model=YourResponse)
def create_your_data(
    payload: YourRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_cookie),
):
    """Create new data."""
    new_item = models.YourModel(
        user_id=current_user.id,
        field1=payload.field1,
        field2=payload.field2,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return new_item

# DELETE Endpoint
@router.delete("/your-endpoint/{item_id}")
def delete_your_data(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_cookie),
):
    """Delete data."""
    item = db.query(models.YourModel).filter(
        models.YourModel.id == item_id,
        models.YourModel.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(item)
    db.commit()
    
    return {"message": "Item deleted"}
```

### Register Router in main.py

```python
# backend/app/main.py

from app.api.your_router import router as your_router

app.include_router(your_router, prefix="/your-prefix", tags=["Your Tag"])
```

---

## 📄 Creating a Protected Page

### Page Template

```typescript
// frontend/src/app/(protected)/your-page/page.tsx

"use client"; // If you need client-side interactivity

import { useTheme } from "@/context/ThemeContext";

export default function YourPage() {
    const { theme } = useTheme();
    
    return (
        <div className={`min-h-screen p-6 ${
            theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}>
            <h1 className="text-3xl font-bold mb-6">Your Page Title</h1>
            
            {/* Your content here */}
        </div>
    );
}
```

### Server Component with Data Fetching

```typescript
// frontend/src/app/(protected)/your-page/page.tsx

import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function fetchYourData() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    
    if (!token) return null;
    
    const backend = 
        process.env.API_URL_INTERNAL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
        "http://localhost:8000";
    
    const res = await fetch(`${backend}/your-endpoint`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Cookie: `access_token=${token}`,
        },
        cache: "no-store",
    });
    
    if (!res.ok) return null;
    return await res.json();
}

export default async function YourPage() {
    const data = await fetchYourData();
    
    if (!data) {
        return <div>Failed to load data</div>;
    }
    
    return (
        <div>
            <h1>Your Page</h1>
            {/* Render data */}
        </div>
    );
}
```

---

## 🗄️ Adding a Database Model

### Model Template

```python
# backend/app/db/models.py

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, DateTime, func, ForeignKey
from .database import Base

class YourModel(Base):
    __tablename__ = "your_table"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("users.id"), 
        nullable=False, 
        index=True
    )
    field1: Mapped[str] = mapped_column(String(255), nullable=False)
    field2: Mapped[int] = mapped_column(Integer, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    
    # Relationship to user
    user: Mapped["User"] = relationship("User", back_populates="your_items")
```

### Update User Model

```python
# backend/app/db/models.py

class User(Base):
    # ... existing fields ...
    
    # Add relationship
    your_items: Mapped[list["YourModel"]] = relationship(
        "YourModel", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
```

### Create Migration (if using Alembic)

```bash
# The database uses SQLAlchemy's create_all() in main.py
# Tables are created automatically on startup
# For manual migrations, consider adding Alembic
```

---

## 📝 Creating a Pydantic Schema

### Schema Template

```python
# backend/app/schemas/your_schema.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class YourItemCreate(BaseModel):
    field1: str = Field(..., min_length=1, max_length=255)
    field2: Optional[int] = Field(None, ge=0)

class YourItemUpdate(BaseModel):
    field1: Optional[str] = Field(None, min_length=1, max_length=255)
    field2: Optional[int] = Field(None, ge=0)

class YourItemResponse(BaseModel):
    id: int
    user_id: int
    field1: str
    field2: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True  # For SQLAlchemy models
```

---

## 🔐 Adding Authentication to Endpoint

### Protected Endpoint Pattern

```python
from app.api.deps import get_current_user_from_cookie
from app.db import models

@router.get("/protected-endpoint")
def protected_endpoint(
    current_user: models.User = Depends(get_current_user_from_cookie),
    db: Session = Depends(get_db),
):
    """This endpoint requires authentication."""
    # current_user is automatically injected
    # Access user data: current_user.id, current_user.email, etc.
    
    return {"user_id": current_user.id, "email": current_user.email}
```

### Alternative: Cookie or Header Token

```python
from fastapi import Header, Cookie
from typing import Optional

@router.get("/endpoint")
def endpoint(
    authorization: Optional[str] = Header(None),
    access_token: Optional[str] = Cookie(None),
):
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]
    elif access_token:
        token = access_token
    
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Validate token...
```

---

## 🌐 Creating a Next.js API Route

### API Route Template

```typescript
// frontend/src/app/api/your-endpoint/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await req.cookies;
        const token = cookieStore.get("access_token")?.value;
        
        if (!token) {
            return NextResponse.json(
                { detail: "Authentication required" },
                { status: 401 }
            );
        }
        
        const backend =
            process.env.API_URL_INTERNAL?.trim() ||
            process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
            "http://localhost:8000";
        
        const response = await fetch(`${backend}/your-endpoint`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Cookie: `access_token=${token}`,
            },
            cache: "no-store",
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return NextResponse.json(
                { detail: data.detail || "Request failed" },
                { status: response.status }
            );
        }
        
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("❌ API route error:", err);
        return NextResponse.json(
            { detail: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const cookieStore = await req.cookies;
        const token = cookieStore.get("access_token")?.value;
        
        if (!token) {
            return NextResponse.json(
                { detail: "Authentication required" },
                { status: 401 }
            );
        }
        
        const backend =
            process.env.API_URL_INTERNAL?.trim() ||
            process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
            "http://localhost:8000";
        
        const response = await fetch(`${backend}/your-endpoint`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                Cookie: `access_token=${token}`,
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });
        
        const data = await response.json();
        
        // Forward cookies if backend sets them
        const nextRes = NextResponse.json(data, { status: response.status });
        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
            nextRes.headers.set("set-cookie", setCookie);
        }
        
        return nextRes;
    } catch (err) {
        console.error("❌ API route error:", err);
        return NextResponse.json(
            { detail: "Internal server error" },
            { status: 500 }
        );
    }
}
```

---

## ⚛️ Adding a React Component

### Client Component Template

```typescript
// frontend/src/components/YourComponent.tsx

"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

interface YourComponentProps {
    data: any;
    onAction?: () => void;
}

export default function YourComponent({ data, onAction }: YourComponentProps) {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    
    const handleClick = async () => {
        setLoading(true);
        try {
            // Your logic here
            if (onAction) onAction();
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className={`p-4 rounded-lg ${
            theme === "dark" 
                ? "bg-gray-800 text-white" 
                : "bg-gray-100 text-gray-900"
        }`}>
            <h2 className="text-xl font-bold mb-4">Your Component</h2>
            <button
                onClick={handleClick}
                disabled={loading}
                className={`px-4 py-2 rounded ${
                    theme === "dark"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-500 hover:bg-blue-600"
                } text-white disabled:opacity-50`}
            >
                {loading ? "Loading..." : "Action"}
            </button>
        </div>
    );
}
```

---

## 🔍 Database Query Patterns

### Get All Items for User

```python
items = db.query(models.YourModel).filter(
    models.YourModel.user_id == current_user.id
).all()
```

### Get Single Item

```python
item = db.query(models.YourModel).filter(
    models.YourModel.id == item_id,
    models.YourModel.user_id == current_user.id
).first()

if not item:
    raise HTTPException(status_code=404, detail="Item not found")
```

### Create New Item

```python
new_item = models.YourModel(
    user_id=current_user.id,
    field1=payload.field1,
    field2=payload.field2,
)
db.add(new_item)
db.commit()
db.refresh(new_item)
```

### Update Item

```python
item = db.query(models.YourModel).filter(
    models.YourModel.id == item_id,
    models.YourModel.user_id == current_user.id
).first()

if not item:
    raise HTTPException(status_code=404, detail="Item not found")

item.field1 = payload.field1
item.field2 = payload.field2
db.commit()
db.refresh(item)
```

### Delete Item

```python
item = db.query(models.YourModel).filter(
    models.YourModel.id == item_id,
    models.YourModel.user_id == current_user.id
).first()

if not item:
    raise HTTPException(status_code=404, detail="Item not found")

db.delete(item)
db.commit()
```

### Check if Item Exists

```python
existing = db.query(models.YourModel).filter(
    models.YourModel.user_id == current_user.id,
    models.YourModel.field1 == value
).first()

if existing:
    raise HTTPException(status_code=400, detail="Item already exists")
```

---

## ⚠️ Error Handling Patterns

### Backend Error Handling

```python
from fastapi import HTTPException

# Not Found
raise HTTPException(status_code=404, detail="Item not found")

# Bad Request
raise HTTPException(status_code=400, detail="Invalid input")

# Unauthorized
raise HTTPException(status_code=401, detail="Authentication required")

# Forbidden
raise HTTPException(status_code=403, detail="Access denied")

# Validation Error (automatic with Pydantic)
# FastAPI automatically returns 422 for validation errors
```

### Frontend Error Handling

```typescript
try {
    const response = await fetch("/api/endpoint");
    const data = await response.json();
    
    if (!response.ok) {
        // Handle error
        const errorMsg = data.detail || data.message || "Request failed";
        alert(errorMsg);
        return;
    }
    
    // Handle success
    console.log("Success:", data);
} catch (err) {
    console.error("Error:", err);
    alert("Network error. Please try again.");
}
```

---

## 📦 Common Code Snippets

### Get Backend URL (Frontend)

```typescript
const backend =
    process.env.API_URL_INTERNAL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
    "http://localhost:8000";
```

### Get Current User (Backend)

```python
from app.api.deps import get_current_user_from_cookie

@router.get("/endpoint")
def endpoint(
    current_user: models.User = Depends(get_current_user_from_cookie),
):
    # Use current_user.id, current_user.email, etc.
    pass
```

### Set Cookie (Backend)

```python
from app.core.config import settings
from typing import cast, Literal

is_production = settings.ENV.lower() == "production"

if is_production:
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="none",
        secure=True,
        max_age=60 * 60 * 24,
        path="/",
    )
else:
    samesite_value = cast(
        Literal["lax", "strict", "none"],
        (settings.COOKIE_SAMESITE or "lax").lower()
    )
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        httponly=True,
        samesite=samesite_value,
        secure=bool(settings.COOKIE_SECURE),
        max_age=60 * 60 * 24,
        path="/",
    )
```

### Theme-Aware Styling (Frontend)

```typescript
const { theme } = useTheme();

<div className={`${
    theme === "dark"
        ? "bg-gray-800 text-white"
        : "bg-white text-gray-900"
}`}>
    Content
</div>
```

### Form with react-hook-form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
    field1: z.string().min(1, "Required"),
    field2: z.number().min(0),
});

type FormData = z.infer<typeof schema>;

export default function YourForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });
    
    const onSubmit = async (data: FormData) => {
        // Handle submission
    };
    
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register("field1")} />
            {errors.field1 && <p>{errors.field1.message}</p>}
            <button type="submit">Submit</button>
        </form>
    );
}
```

---

## 🚀 Quick Checklist

When adding a new feature:

- [ ] Create database model (if needed)
- [ ] Create Pydantic schemas
- [ ] Create backend router with endpoints
- [ ] Register router in `main.py`
- [ ] Create Next.js API route (if needed)
- [ ] Create frontend page/component
- [ ] Add authentication if needed
- [ ] Test locally
- [ ] Update environment variables if needed
- [ ] Deploy and test in production

---

**Last Updated:** 2024
**Version:** 1.0

