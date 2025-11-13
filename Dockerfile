FROM docker.io/library/node:lts-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN corepack enable
RUN pnpm install

FROM docker.io/library/node:lts-alpine AS production-dependencies-env
COPY ./package.json pnpm-lock.yaml /app/
WORKDIR /app
RUN corepack enable
RUN pnpm install --prod

FROM docker.io/library/node:lts-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN corepack enable
RUN pnpm build

FROM docker.io/library/node:lts-alpine
COPY ./package.json pnpm-lock.yaml /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
RUN corepack enable
CMD ["pnpm", "start"]