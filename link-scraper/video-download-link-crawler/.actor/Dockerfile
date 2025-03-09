FROM apify/actor-node:16

# Copy package.json and package-lock.json to the container
COPY package.json ./

# Install NPM packages
RUN npm --quiet set progress=false \
    && npm install --only=prod --no-optional \
    && echo "Installed NPM packages:"

# Copy the rest of the actor files
COPY . ./

ENV NODE_ENV=production

# Run the actor
CMD ["node", "app.js"]