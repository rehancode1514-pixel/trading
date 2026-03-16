FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN rm -f package-lock.json && npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
