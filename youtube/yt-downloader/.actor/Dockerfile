FROM node:alpine

ENV NODE_ENV=production

# Install dependencies and create a Python virtual environment
RUN apk update -q && \
    apk add --no-cache -q python3 py3-pip ffmpeg && \
    python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --quiet --upgrade pip yt-dlp && \
    rm -rf /var/cache/apk/* /opt/venv/share/python-wheels/*

# Update the PATH to include the virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Set the working directory inside the container
WORKDIR /app

# Copy project files
COPY package*.json ./

# Install Node.js dependencies (without development dependencies)
RUN npm install --omit=dev --silent
COPY . .

# Start the application
CMD ["npm", "start", "--silent"]