FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NODE_HOST $NODE_HOST
ARG SUPABASE_URL $SUPABASE_URL
ARG SUPABASE_ANON_KEY $SUPABASE_ANON_KEY
ARG SERVICE_KEY $SERVICE_KEY
ARG CREATE_USERS $CREATE_USERS

ENV NEXT_TELEMETRY_DISABLED 1

ENV NEXT_PUBLIC_SUPABASE_URL http://localhost:8000
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY $SUPABASE_ANON_KEY
ENV SUPABASE_URL http://kong:8000
ENV SUPABASE_SERVICE_KEY $SERVICE_KEY
ENV CREATE_USERS $CREATE_USERS
ENV NEXT_PUBLIC_NODE_HOST http://localhost:4008
ENV NODE_HOST http://dcs:4008

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 4004

ENV PORT 4004

CMD ["node", "server.js"]
