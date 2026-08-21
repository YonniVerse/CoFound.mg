# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS build
WORKDIR /workspace

RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

COPY apps/api apps/api
COPY packages/shared packages/shared
RUN pnpm --filter @cofound/shared build \
  && pnpm --filter @cofound/api prisma:generate \
  && pnpm --filter @cofound/api build \
  && pnpm deploy --filter @cofound/api --prod --legacy /runtime

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /runtime ./
COPY --from=build /workspace/apps/api/dist ./dist
COPY --from=build /workspace/apps/api/prisma ./prisma

EXPOSE 3000
USER node

CMD ["node", "dist/main.js"]
