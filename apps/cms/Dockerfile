# Production image for the Strapi CMS.
#
# Build context is apps/cms on its own — it has its own package-lock.json,
# separate from the Nx workspace's. Locally Strapi runs as `strapi develop`
# (`nx serve cms`); this image builds the admin panel once and runs
# `strapi start`, which never rebuilds or watches.
#
# Node matches the local toolchain (24 LTS). Debian slim rather than Alpine so
# sharp, which the upload plugin uses for image formats, gets its glibc
# prebuilds from the lockfile instead of compiling libvips.

FROM node:24-bookworm-slim AS build
WORKDIR /opt/app

COPY package.json package-lock.json ./
# Dev dependencies included: `strapi build` needs TypeScript to compile
# config/ and src/ into dist/.
RUN npm ci

COPY . .
ENV NODE_ENV=production
# The admin panel build peaks past the ~900MB heap Node picks by default on a
# 2GB host (t4g.small) and dies with "heap out of memory". Raising the ceiling
# lets it spill into swap instead; harmless on machines with more RAM.
RUN NODE_OPTIONS=--max-old-space-size=2048 npm run build && npm prune --omit=dev

FROM node:24-bookworm-slim
WORKDIR /opt/app
ENV NODE_ENV=production

# Owned by `node` so the public/ volume, which Docker seeds from the image's
# public/ on first mount, is writable by the process that writes media.
COPY --from=build --chown=node:node /opt/app ./
USER node

EXPOSE 1337
# The binary directly, not `npm run start`: npm doesn't forward SIGTERM
# reliably, so `docker compose down` would wait out the 10s kill timeout.
CMD ["node_modules/.bin/strapi", "start"]
