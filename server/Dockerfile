FROM node:alpine as build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 7001
CMD ["node", "index.js"]
