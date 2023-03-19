FROM node:16-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY .git_commit.json ./

RUN npm ci --only=production --ignore-scripts

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 9080

CMD ["npm","run","start:prod"]
