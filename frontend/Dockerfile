# frontend/Dockerfile

# ============================================================
# 1️⃣  Builder stage
# ============================================================
FROM node:20-alpine AS builder
WORKDIR /app

# ------------------------------------------------------------
# Install dependencies first (cached layer if lockfile unchanged)
# ------------------------------------------------------------
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm install; \
  fi

# ------------------------------------------------------------
# Copy project files
# ------------------------------------------------------------
COPY . .

# ------------------------------------------------------------
# Build-time environment variables
# ------------------------------------------------------------
# ✅ Accept build args from docker-compose (or Vercel)
ARG NEXT_PUBLIC_API_URL_BROWSER
ARG API_URL_INTERNAL

# ✅ Provide defaults for local Docker builds
# - `NEXT_PUBLIC_API_URL_BROWSER` is what browsers see (localhost:8000)
# - `API_URL_INTERNAL` is what the container uses internally (ai_backend:8000)
ENV NEXT_PUBLIC_API_URL_BROWSER=${NEXT_PUBLIC_API_URL_BROWSER:-http://localhost:8000}
ENV API_URL_INTERNAL=${API_URL_INTERNAL:-http://ai_backend:8000}

# ------------------------------------------------------------
# Build the Next.js app (standalone for smaller runtime image)
# ------------------------------------------------------------
RUN npm run build

# ============================================================
# 2️⃣  Runtime stage
# ============================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# ------------------------------------------------------------
# Copy compiled build output
# ------------------------------------------------------------
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# ------------------------------------------------------------
# Runtime environment variables
# These can still be overridden by docker-compose or Vercel.
# ------------------------------------------------------------
ENV NEXT_PUBLIC_API_URL_BROWSER=${NEXT_PUBLIC_API_URL_BROWSER:-http://localhost:8000}
ENV API_URL_INTERNAL=${API_URL_INTERNAL:-http://ai_backend:8000}

EXPOSE 3000

# ------------------------------------------------------------
# Start the app
# ------------------------------------------------------------
CMD ["node", "server.js"]
