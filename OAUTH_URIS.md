# OAuth URI Configuration Checklist

Use this checklist to configure all the URIs in your OAuth apps.

## 🔵 Google OAuth App (Single App - Works for Both Dev & Prod)

### In Google Cloud Console → OAuth Client → Authorized redirect URIs:

Add **both** of these URIs (Google allows multiple):

1. **Development**: `http://localhost:8000/auth/google/callback`
2. **Production**: `https://your-backend-url.com/auth/google/callback`
   - Replace `your-backend-url.com` with your actual backend domain (e.g., `your-app.up.railway.app`)

### Authorized JavaScript origins (if required):

1. **Development**: `http://localhost:8000`
2. **Production**: `https://your-backend-url.com`

---

## 🐙 GitHub OAuth App #1 - Development

### In GitHub Developer Settings → OAuth App → Settings:

**Application name**: `Profit Path (Dev)` (or similar)

**Homepage URL**: 
```
http://localhost:3000
```

**Authorization callback URL**:
```
http://localhost:8000/auth/github/callback
```

**Note**: This is the ONLY callback URL you can set for this app.

---

## 🐙 GitHub OAuth App #2 - Production

### In GitHub Developer Settings → OAuth App → Settings:

**Application name**: `Profit Path (Prod)` (or similar)

**Homepage URL**: 
```
https://your-frontend-url.vercel.app
```
- Replace with your actual Vercel frontend URL

**Authorization callback URL**:
```
https://your-backend-url.com/auth/github/callback
```
- Replace `your-backend-url.com` with your actual backend domain (e.g., `your-app.up.railway.app`)

**Note**: This is the ONLY callback URL you can set for this app.

---

## 📋 Quick Reference Table

| OAuth Provider | Environment | Callback URI |
|----------------|-------------|--------------|
| Google | Development | `http://localhost:8000/auth/google/callback` |
| Google | Production | `https://your-backend-url.com/auth/google/callback` |
| GitHub (Dev App) | Development | `http://localhost:8000/auth/github/callback` |
| GitHub (Prod App) | Production | `https://your-backend-url.com/auth/github/callback` |

---

## ✅ Verification Checklist

After configuring, verify:

- [ ] Google OAuth has **both** dev and prod callback URIs added
- [ ] GitHub Dev OAuth app has `http://localhost:8000/auth/github/callback`
- [ ] GitHub Prod OAuth app has `https://your-backend-url.com/auth/github/callback`
- [ ] All callback URIs point to the **backend**, not the frontend
- [ ] Production URIs use `https://` (not `http://`)
- [ ] Development URIs use `http://localhost:8000` (not `localhost:3000`)

---

## 🔍 Common Mistakes to Avoid

❌ **Wrong**: `http://localhost:3000/auth/google/callback` (frontend URL)
✅ **Correct**: `http://localhost:8000/auth/google/callback` (backend URL)

❌ **Wrong**: `https://your-frontend.vercel.app/auth/github/callback` (frontend URL)
✅ **Correct**: `https://your-backend.railway.app/auth/github/callback` (backend URL)

❌ **Wrong**: Using `http://` in production
✅ **Correct**: Always use `https://` in production

---

## 📝 Environment Variables Reminder

After configuring the OAuth apps, make sure your environment variables are set:

**Development (.env)**:
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-dev-client-id
GITHUB_CLIENT_SECRET=your-github-dev-client-secret

FRONTEND_URL=http://localhost:3000
```

**Production (Railway/Vercel)**:
```bash
GOOGLE_CLIENT_ID=your-google-client-id  # Same as dev
GOOGLE_CLIENT_SECRET=your-google-client-secret  # Same as dev

GITHUB_CLIENT_ID=your-github-prod-client-id  # Different from dev!
GITHUB_CLIENT_SECRET=your-github-prod-client-secret  # Different from dev!

FRONTEND_URL=https://your-frontend.vercel.app
```

