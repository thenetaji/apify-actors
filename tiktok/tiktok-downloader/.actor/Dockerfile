FROM node:alpine

# Set environment to production
ENV NODE_ENV=production

# Install dependencies
RUN apk add --no-cache python3 py3-pip ffmpeg && \
    python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --quiet --upgrade pip yt-dlp && \
    rm -rf /var/cache/apk/*

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH"

RUN apk add --no-cache ca-certificates

# Set the working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --silent

# Copy the rest of the application files
COPY . .

# Start the application
CMD ["npm", "start", "--silent"]