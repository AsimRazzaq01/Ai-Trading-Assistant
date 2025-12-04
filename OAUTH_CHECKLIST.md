# OAuth Configuration Checklist

## ✅ Configuration Status

### Backend Environment Variables (`backend/.env`)

- [x] `GOOGLE_CLIENT_ID` - Set
- [x] `GOOGLE_CLIENT_SECRET` - Set
- [x] `GOOGLE_REDIRECT_URI` - Set to `http://localhost:8000/auth/google/callback`
- [x] `GITHUB_CLIENT_ID` - Set (Development)
- [x] `GITHUB_CLIENT_SECRET` - Set (Development)
- [x] `GITHUB_REDIRECT_URI` - Set to `http://localhost:8000/auth/github/callback`
- [x] `FRONTEND_URL` - Set to `http://localhost:3000`

### OAuth Provider Configuration

#### Google OAuth App
- [ ] Authorized redirect URI: `http://localhost:8000/auth/google/callback` (Development)
- [ ] Authorized redirect URI: `https://your-backend-url.com/auth/google/callback` (Production)
- [ ] Client ID matches `GOOGLE_CLIENT_ID` in backend/.env
- [ ] Client Secret matches `GOOGLE_CLIENT_SECRET` in backend/.env

#### GitHub OAuth App (Development)
- [ ] Authorization callback URL: `http://localhost:8000/auth/github/callback`
- [ ] Client ID matches `GITHUB_CLIENT_ID` in backend/.env
- [ ] Client Secret matches `GITHUB_CLIENT_SECRET` in backend/.env

#### GitHub OAuth App (Production)
- [ ] Authorization callback URL: `https://your-backend-url.com/auth/github/callback`
- [ ] Client ID and Secret configured in production environment variables

### Code Implementation

- [x] OAuth routes implemented in `backend/app/api/auth_router.py`
- [x] Google OAuth login route: `/auth/google/login`
- [x] Google OAuth callback route: `/auth/google/callback`
- [x] GitHub OAuth login route: `/auth/github/login`
- [x] GitHub OAuth callback route: `/auth/github/callback`
- [x] Frontend OAuth buttons link to backend routes
- [x] Cookie authentication configured for OAuth users

### Testing

- [ ] Test Google OAuth login locally
- [ ] Test GitHub OAuth login locally
- [ ] Verify user is created in database after OAuth login
- [ ] Verify cookie is set after OAuth login
- [ ] Verify redirect to dashboard after OAuth login

## 🔧 Next Steps for Production

1. **Create Production GitHub OAuth App** (if not done)
   - Go to GitHub Developer Settings
   - Create new OAuth App with production callback URL
   - Copy Client ID and Secret

2. **Update Production Environment Variables**
   ```bash
   # In Railway/Vercel production environment
   GOOGLE_CLIENT_ID=<same as dev>
   GOOGLE_CLIENT_SECRET=<same as dev>
   GOOGLE_REDIRECT_URI=https://your-backend-url.com/auth/google/callback
   
   GITHUB_CLIENT_ID=<production-github-client-id>
   GITHUB_CLIENT_SECRET=<production-github-client-secret>
   GITHUB_REDIRECT_URI=https://your-backend-url.com/auth/github/callback
   
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ENV=production
   ```

3. **Verify OAuth Provider Settings**
   - Google: Add production callback URI to authorized redirect URIs
   - GitHub: Update production OAuth app with production callback URI

## 🐛 Troubleshooting

If OAuth is not working:

1. **Check Backend Logs**
   - Look for "OAuth not configured" errors
   - Verify environment variables are loaded

2. **Verify Redirect URIs**
   - Must match exactly (including http/https, port, path)
   - Backend callback URLs, not frontend URLs

3. **Check CORS**
   - Ensure frontend URL is in `ALLOWED_ORIGINS`

4. **Test OAuth Routes Directly**
   - Visit `http://localhost:8000/auth/google/login` in browser
   - Should redirect to Google login page








