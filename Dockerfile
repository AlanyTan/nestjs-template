################
# Run-time image
################
FROM node:18-alpine AS build

RUN apk add --no-cache openssh-client git
RUN mkdir -p -m 0600 ~/.ssh && ssh-keyscan -H github.com >> ~/.ssh/known_hosts

WORKDIR /usr/app
COPY --chown=node:node package*.json ./
RUN --mount=type=ssh npm ci

COPY --chown=node:node . .
RUN npm run build

ENV NODE_ENV=production
### currently the Acerta-standardnpm requires prepublish script to compile and be functional, so --ignore scripts can't be used
RUN npm pkg delete scripts.prepare
RUN --mount=type=ssh npm ci --omit=dev && npm cache clean --force

USER node

################
# Run-time image
################
FROM node:18-alpine
ENV NODE_ENV=production

#RUN apk update && apk add git openssh-client

WORKDIR /usr/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=build /usr/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/app/dist ./dist
COPY --chown=node:node .build-info.json ./

EXPOSE 9080

USER node

ENTRYPOINT ["npm","run","start"]
