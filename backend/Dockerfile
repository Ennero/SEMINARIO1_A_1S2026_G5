FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install -g npm@11.11.0
RUN npm install --omit=dev

COPY . .

EXPOSE 5000

CMD ["npm", "start"]