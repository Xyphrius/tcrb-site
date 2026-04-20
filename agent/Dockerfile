# TCRB Agent — Fly.io Dockerfile
# Node 20 with native canvas dependencies for image generation
FROM node:20-bookworm-slim

# System dependencies for node-canvas (cairo, pango, jpeg, gif, rsvg)
# Plus git for repo operations and openssh-client for HTTPS git
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    pkg-config \
    git \
    ca-certificates \
    curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies first (cached layer)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy agent code
COPY . .

# Make start script executable
RUN chmod +x ./start.sh

# Persistent data volume mount point
# /data holds: cloned tcrb-site repo + agent output (review queue, market data, signups)
RUN mkdir -p /data && rm -rf /app/output && ln -s /data/output /app/output

# Environment defaults — overridden by fly.toml [env] and secrets
ENV NODE_ENV=production
ENV PORT=8080
ENV SITE_REPO_PATH=/data/tcrb-site
ENV DATA_UPDATE_INTERVAL_HOURS=4

EXPOSE 8080

# Health check
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -fsS http://localhost:8080/health || exit 1

ENTRYPOINT ["./start.sh"]
