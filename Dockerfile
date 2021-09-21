FROM node:14 AS build

RUN npm install -g npm@^7.23.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:14

RUN npm install -g npm@^7.23.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/main"]