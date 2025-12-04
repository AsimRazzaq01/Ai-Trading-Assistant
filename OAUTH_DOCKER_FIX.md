# OAuth Docker Fix - Internal Server Error

## 🔍 Problem

You're getting an "Internal Server Error" when clicking Google/GitHub OAuth buttons. This is because:

1. **Docker container needs to be rebuilt** - The container was built before OAuth dependencies were added
2. **Dependencies need to be installed** - Authlib, starlette, and httpx need to be in the container

## ✅ Solution: Rebuild Docker Container

Since you're using Docker Compose, you need to rebuild the backend container:

### Option 1: Rebuild and Restart (Recommended)

```bash
docker compose down
docker compose up --build -d
```

This will:
- Stop all containers
- Rebuild the backend container with updated dependencies
- Start everything back up

### Option 2: Rebuild Just Backend

```bash
docker compose build ai_backend
docker compose up -d ai_backend
```

### Option 3: View Logs While Rebuilding

```bash
docker compose down
docker compose up --build
```

This will show you the build process and any errors.

## 🔍 Verify It's Working

After rebuilding, check:

1. **Test OAuth Debug Endpoint**:
   ```
   http://localhost:8000/oauth/debug
   ```
   Should show OAuth configuration status

2. **Test Google OAuth**:
   ```
   http://localhost:8000/auth/google/login
   ```
   Should redirect to Google login

3. **Test GitHub OAuth**:
   ```
   http://localhost:8000/auth/github/login
   ```
   Should redirect to GitHub login

## 📋 What Was Fixed

1. ✅ Added better error handling to OAuth routes
2. ✅ Added debug endpoint at `/oauth/debug`
3. ✅ Made OAuth initialization lazy (avoids import-time errors)
4. ✅ Added detailed error messages with stack traces

## 🐛 If Still Getting Errors

After rebuilding, if you still get errors:

1. **Check Docker logs**:
   ```bash
   docker compose logs ai_backend
   ```

2. **Check the debug endpoint**:
   Visit `http://localhost:8000/oauth/debug` to see OAuth config status

3. **Verify environment variables**:
   Make sure `backend/.env` has all OAuth credentials set

4. **Check the error message**:
   The new error handling will show detailed error messages instead of generic "Internal Server Error"

## 📝 Dependencies in Container

The Dockerfile installs from `backend/requirements.txt` which includes:
- ✅ Authlib==1.3.1
- ✅ starlette==0.38.6
- ✅ httpx==0.27.2

These will be installed when you rebuild the container.







