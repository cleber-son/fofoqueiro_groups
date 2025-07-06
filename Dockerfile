FROM node:20

# Instala Chromium e dependências do Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation libappindicator3-1 libatk-bridge2.0-0 \
    libatk1.0-0 libcups2 libdbus-1-3 libdrm2 libxss1 libgtk-3-0 \
    libnss3 libasound2 libx11-xcb1 libxcomposite1 libxdamage1 \
    libxrandr2 libgbm1 libxshmfence1 libxtst6 libxi6 libxfixes3 \
    libx11-6 libxrender1 libxkbcommon0 ca-certificates \
    --no-install-recommends && apt-get clean

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "index.js"]
