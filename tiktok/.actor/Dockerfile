# Build Stage
FROM node:alpine AS BUILDER

WORKDIR /app

# Set environment to production for optimized dependency installation
ENV NODE_ENV=production

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --silent

# Copy the rest of the application files
COPY . .

# Production Stage
FROM node:alpine

# Set environment to production (ensures production optimizations in runtime)
ENV NODE_ENV=production

# Install dependencies and create a Python virtual environment
RUN apk update -q && \
    apk add --no-cache -q python3 py3-pip ffmpeg && \
    python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --quiet --upgrade pip yt-dlp && \
    rm -rf /var/cache/apk/* /opt/venv/share/python-wheels/*

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH"

# Set the working directory
WORKDIR /app

# Copy built files from the builder stage
COPY --from=BUILDER /app .

# Expose the port (if your app runs on a specific port, e.g., 3000)
EXPOSE 3000

# Start the application
CMD ["npm", "start", "--silent"]