FROM node:18-alpine3.16

RUN apk update
RUN apk upgrade
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json /app
COPY pnpm-workspaces.yaml /app
copy client* /app/client
COPY server* /app/server

RUN pnpm --filter server install
RUN pnpm --filter client install
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
