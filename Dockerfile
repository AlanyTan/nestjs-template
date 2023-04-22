FROM node:16-alpine AS build

ARG NPM_TOKEN=default_value

#ENV NPM_TOKEN_env_var=$NPM_TOKEN

WORKDIR /usr/src/app

COPY package*.json ./
COPY .npmrc ./
RUN apk add --no-cache openssh-client git
RUN mkdir -p -m 0600 ~/.ssh && ssh-keyscan -H github.com >> ~/.ssh/known_hosts
#RUN npm install husky --save-dev 
#RUN npm run prepare

#RUN --mount=type=ssh npm ci
RUN npm ci

COPY . .

RUN npm run build

COPY .example.env ./

# RUN env $(grep -vE "^[  ]*#"  .example.env) npm run test

FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY .git_commit.json ./

#RUN npm ci --only=production --ignore-scripts

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 9080

CMD ["npm","run","start:prod"]
