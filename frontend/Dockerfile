FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm install -g serve@14.2.4

COPY --from=builder /usr/src/app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]