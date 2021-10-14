FROM node:14 AS build

RUN npm i -g npm@^8.0.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

FROM node:14

RUN npm i -g npm@^8.0.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production --ignore-scripts

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/main"]