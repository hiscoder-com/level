FROM node:18-alpine AS base

# Step 1. Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock* ./
COPY node_modules ./node_modules
# Omit --production flag for TypeScript devDependencies
# RUN \
#   if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
#   # Allow install without lockfile, so example works even without Node.js installed locally
#   else echo "Lockfile not found. It is recommended to commit lockfiles to version control." && yarn install; \
#   fi

COPY components ./components
COPY images ./images
COPY lib ./lib
COPY pages ./pages
COPY public ./public
COPY styles ./styles
COPY utils ./utils
COPY jsconfig.json .
COPY next-i18next.config.js .
COPY next.config.js .
COPY postcss.config.js .
COPY tailwind.config.js .

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030
ARG SUPABASE_URL $SUPABASE_URL
ARG DCS_HOST $DCS_HOST
ARG SUPABASE_ANON_KEY $SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_KEY $SUPABASE_SERVICE_KEY

ENV NEXT_TELEMETRY_DISABLED 1

ENV NEXT_PUBLIC_SUPABASE_URL $SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY $SUPABASE_ANON_KEY
ENV SUPABASE_URL http://kong:8000
ENV SUPABASE_SERVICE_KEY $SUPABASE_SERVICE_KEY
ENV CREATE_USERS all
ENV NEXT_PUBLIC_NODE_HOST $DCS_HOST
ENV NODE_HOST http://dcs:4008
ENV NEXT_PUBLIC_INTRANET true

# Build Next.js
RUN yarn build

# Note: It is not necessary to add an intermediate step that does a full copy of `node_modules` here

# Step 2. Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app


# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Environment variables must be redefined at run time
ARG SUPABASE_URL $SUPABASE_URL
ARG DCS_HOST $DCS_HOST
ARG SUPABASE_ANON_KEY $SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_KEY $SUPABASE_SERVICE_KEY

ENV NEXT_TELEMETRY_DISABLED 1

ENV NEXT_PUBLIC_SUPABASE_URL $SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY $SUPABASE_ANON_KEY
ENV SUPABASE_URL http://kong:8000
ENV SUPABASE_SERVICE_KEY $SUPABASE_SERVICE_KEY
ENV CREATE_USERS all
ENV NEXT_PUBLIC_NODE_HOST $DCS_HOST
ENV NODE_HOST http://dcs:4008

ENV NODE_ENV production

EXPOSE 4004

ENV PORT 4004

# Note: Don't expose ports here, Compose will handle that for us
CMD ["node", "server.js"]
