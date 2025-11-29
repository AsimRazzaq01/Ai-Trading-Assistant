# OAuth Setup Guide

This guide explains how to set up Google and GitHub OAuth authentication for the Profit Path application.

## Overview

The application supports OAuth authentication through Google and GitHub. Users can sign in using their existing accounts without creating a new password.

## Backend Configuration

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - **Local Development**: `http://localhost:8000/auth/google/callback`
   - **Production**: `https://your-backend-url.com/auth/google/callback`
7. Copy the Client ID and Client Secret

### 2. GitHub OAuth Setup

**Important**: GitHub only allows **one callback URL** per OAuth app. You have two options:

#### Option A: Separate OAuth Apps (Recommended)

Create **two separate GitHub OAuth apps** - one for development and one for production:

**Development OAuth App:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Profit Path (Dev)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:8000/auth/github/callback`
4. Click "Register application"
5. Copy the Client ID and generate a Client Secret
6. Save these as `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` for local development

**Production OAuth App:**
1. Create another OAuth App with:
   - **Application name**: Profit Path (Prod)
   - **Homepage URL**: `https://your-app.vercel.app`
   - **Authorization callback URL**: `https://your-backend-url.com/auth/github/callback`
2. Use different environment variables for production (or update them when deploying)

#### Option B: Single OAuth App (Update URI when needed)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Profit Path
   - **Homepage URL**: Your production frontend URL
   - **Authorization callback URL**: Your **production** backend callback URL
     - Example: `https://your-backend-url.com/auth/github/callback`
4. Click "Register application"
5. Copy the Client ID and generate a Client Secret

**For local development**, you'll need to:
- Temporarily update the callback URL in GitHub to `http://localhost:8000/auth/github/callback` when testing locally
- Or use a production-like setup (ngrok, etc.) for local testing

### 3. Environment Variables

**For Local Development** - Add to your backend `.env` file:

```bash
# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback  # Optional, auto-detected if not set

# OAuth - GitHub (Development)
GITHUB_CLIENT_ID=your-github-dev-client-id
GITHUB_CLIENT_SECRET=your-github-dev-client-secret
GITHUB_REDIRECT_URI=http://localhost:8000/auth/github/callback  # Optional, auto-detected if not set

# Frontend URL (for redirects after OAuth)
FRONTEND_URL=http://localhost:3000
```

### 4. Production Configuration

For production, update the environment variables:

```bash
ENV=production
FRONTEND_URL=https://your-app.vercel.app

# OAuth - Google (same credentials work for both dev and prod)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-backend-url.com/auth/google/callback

# OAuth - GitHub (use PRODUCTION OAuth app credentials)
GITHUB_CLIENT_ID=your-github-prod-client-id
GITHUB_CLIENT_SECRET=your-github-prod-client-secret
GITHUB_REDIRECT_URI=https://your-backend-url.com/auth/github/callback
```

**Important Notes**:
- **Google**: You can add multiple redirect URIs in Google Cloud Console, so one OAuth app works for both dev and prod
- **GitHub**: Since GitHub only allows one callback URL, you need either:
  - **Separate OAuth apps** for dev and prod (recommended), OR
  - **Update the callback URL** in your GitHub OAuth app when switching between environments
- Make sure the redirect URIs in your OAuth provider settings match the **backend callback URLs**, not the frontend URLs

## How It Works

1. User clicks "Continue with Google" or "Continue with GitHub" on the login page
2. User is redirected to the OAuth provider (Google/GitHub) for authentication
3. After authentication, the provider redirects back to the backend callback URL
4. Backend processes the OAuth response, creates/updates the user, and sets an authentication cookie
5. User is redirected to the dashboard

## User Account Linking

- If a user signs in with OAuth and an account with the same email already exists, the OAuth provider will be linked to that account
- Users can have multiple OAuth providers linked to the same account (same email)
- OAuth users don't need passwords (a random password is generated for database compatibility)

## Troubleshooting

### OAuth not working

1. **Check environment variables**: Ensure all OAuth credentials are set correctly
2. **Verify redirect URIs**: Make sure the redirect URIs in your OAuth provider settings match your backend callback URLs
3. **Check CORS**: Ensure your frontend URL is in the `ALLOWED_ORIGINS` list
4. **Check logs**: Look for OAuth errors in the backend logs

### Common Issues

- **"OAuth not configured"**: Missing `GOOGLE_CLIENT_ID` or `GITHUB_CLIENT_ID` in environment variables
- **"Invalid redirect URI"**: The redirect URI in your OAuth provider settings doesn't match the backend callback URL
  - **GitHub**: Remember to update the callback URL in your GitHub OAuth app when switching between dev/prod, or use separate apps
- **"Email not provided"**: Some GitHub accounts have private emails - ensure you're requesting the `user:email` scope
- **GitHub callback URL mismatch**: If you're using a single GitHub OAuth app, make sure the callback URL in GitHub matches your current environment (dev or prod)

## Security Notes

- OAuth credentials (Client ID and Secret) should never be committed to version control
- Use environment variables for all sensitive configuration
- In production, always use HTTPS for OAuth callbacks
- The authentication cookie is HttpOnly and Secure in production

