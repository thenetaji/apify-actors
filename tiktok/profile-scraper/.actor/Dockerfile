FROM node:alpine

# Set environment to production
ENV NODE_ENV=production

# Set the working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --silent

# Copy the rest of the application files
COPY . .

# Start the application
CMD ["npm", "start", "--silent"]