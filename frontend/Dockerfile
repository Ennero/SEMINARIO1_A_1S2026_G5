FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install -g npm@11.11.0
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /usr/src/app

RUN npm install -g serve@14.2.4

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]