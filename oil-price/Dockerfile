FROM node:alpine

RUN apk add --no-cache chromium

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json .
RUN npm install --omit=dev

COPY . .

CMD ["npm", "start"]