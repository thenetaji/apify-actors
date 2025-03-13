FROM node:alpine

WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies before copying the rest of the files
RUN npm ci --only=prod --no-optional

# Copy the rest of the application files
COPY . ./

ENV NODE_ENV=production

# Run the application
CMD ["npm", "start"]