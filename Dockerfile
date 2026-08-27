# Multi-stage Docker build for ASCII Directory Web App

# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json tsconfig.json vite.config.ts ./

# Install all dependencies including devDependencies for build
RUN npm install

# Copy source code
COPY src/ ./src/

# Build client and server bundles
RUN npm run build

# Production Runner Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy package files and install only production dependencies
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy compiled artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Create volume directory for persistent data and backups
RUN mkdir -p /app/data /app/data/backups

VOLUME ["/app/data"]

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/system/ping || exit 1

CMD ["node", "dist/server/index.js"]
