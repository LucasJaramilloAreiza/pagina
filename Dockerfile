FROM oven/bun:1.3.5-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
COPY package.json bun.lock* ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/docs/package.json ./apps/docs/package.json
COPY packages/api/package.json ./packages/api/package.json
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/env/package.json ./packages/env/package.json
COPY packages/fiscal/package.json ./packages/fiscal/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN bun install --frozen-lockfile --ignore-scripts

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV BETTER_AUTH_SECRET=build-placeholder
ENV NEXT_PUBLIC_BASE_URL=http://localhost:3000
RUN bun --cwd apps/web run build

FROM base AS runtime
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=build /app/apps/web/.next/standalone /app
COPY --from=build /app/apps/web/.next/static /app/apps/web/.next/static
COPY --from=build /app/apps/web/public /app/apps/web/public
COPY --from=build /app/apps/web/package.json /app/apps/web/package.json
COPY --from=build /app/apps/web/next.config.mjs /app/apps/web/next.config.mjs
COPY --from=build /app/apps/web/src /app/apps/web/src
COPY --from=build /app/apps/web/data /app/apps/web/data
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
