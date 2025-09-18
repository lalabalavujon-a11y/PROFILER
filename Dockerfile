# Use official Node.js 22 LTS Alpine image for smaller size
FROM node:22.12.0-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@9.12.0

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY .nvmrc .node-version ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Build the application
RUN pnpm build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S profiler -u 1001

# Change ownership of the app directory
RUN chown -R profiler:nodejs /app
USER profiler

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version && curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["pnpm", "start"]
