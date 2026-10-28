FROM node:20-alpine

WORKDIR /app

# Pehle package.json copy karke install karte hain (Docker caching ke liye)
COPY package*.json ./
RUN npm install --production

# Baaki code copy karte hain
COPY . .

# Express server ka port expose karte hain
EXPOSE 5000

# Backend server start karne ki command
CMD ["node", "server.js"]
