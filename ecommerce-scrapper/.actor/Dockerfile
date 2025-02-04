FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy project files
COPY package*.json ./

# Install Node.js dependencies (without development dependencies)
RUN npm install --omit=dev
COPY . .

# Start the application
CMD ["npm", "start", "--silent"]