FROM node:14 AS build

RUN npm i -g npm@^7.24.2

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

FROM node:14

ENV NODE_ENV=production

RUN npm i -g npm@^7.24.2

WORKDIR /usr/src/app

COPY package*.json ./

COPY .env* ./

RUN npm ci --only=production --ignore-scripts

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 9080

#ENTRYPOINT ["node", "dist/main"]
USER node
CMD ["npm", "start"]