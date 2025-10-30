# ============================
# 🐍 Base image
# ============================
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# ----------------------------
# 🧩 System dependencies
# ----------------------------
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/

# ----------------------------
# 📦 Install Python dependencies
# ----------------------------
# Copy requirements first (for Docker caching)
COPY requirements.txt .

# Install everything cleanly (no cache)
RUN pip install --no-cache-dir -r requirements.txt

# ----------------------------
# 📁 Copy backend code
# ----------------------------
COPY app ./app

# ----------------------------
# ⚙️ Environment config
# ----------------------------
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Expose FastAPI port
EXPOSE 8000

# Use $PORT if provided by host (Railway/Render), else 8000 for local/dev
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

# ----------------------------
# 🚀 Start FastAPI app
# ----------------------------
#CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]











# backend/Dockerfile
#
#FROM python:3.12-slim
#
#WORKDIR /app
#
## --- System Dependencies ---
## build-essential: for compiling bcrypt & psycopg2
## libpq-dev: PostgreSQL client libraries
#RUN apt-get update && apt-get install -y \
#    build-essential \
#    libpq-dev \
#    && rm -rf /var/lib/apt/lists/*
#
## --- Install Python Dependencies ---
#COPY requirements.txt .
#
## First install dependencies from requirements.txt
#RUN pip install --no-cache-dir -r requirements.txt
#
## FIX: Force a compatible bcrypt version for Passlib
## (the latest bcrypt >4.2 has breaking changes)
#RUN pip install --no-cache-dir 'bcrypt==4.1.2'
#
## --- Copy Application Code ---
#COPY app ./app
#
## --- Environment Variables ---
#ENV PYTHONUNBUFFERED=1
#
## --- Expose FastAPI Port ---
#EXPOSE 8000
#
## --- Run the App ---
#CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


##backend/Dockerfile
#FROM python:3.12-slim
#WORKDIR /app
#
#
## System deps
#RUN apt-get update && apt-get install -y build-essential libpq-dev && rm -rf /var/lib/apt/lists/*
#
#
#COPY requirements.txt .
#RUN pip install --no-cache-dir -r requirements.txt
#
#
#COPY app ./app
#
#
#ENV PYTHONUNBUFFERED=1
#EXPOSE 8000
#CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]