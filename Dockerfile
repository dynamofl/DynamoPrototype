# syntax=docker/dockerfile:1.7

# Base images are mirrored from Chainguard into our private ECR repo
# (`dynamoai-base`) by chainguard-poc/push-dynamoprototype-bases-to-ecr.sh.
# This keeps build/runtime pulls inside our AWS account and removes any
# dependency on cgr.dev pull credentials at build / deploy time.
#
# The mirror script is the source of truth for which Chainguard images
# back which ECR tag - re-run it to refresh the mirror.
ARG BASE_REGISTRY=058264092984.dkr.ecr.us-east-1.amazonaws.com/dynamoai-base

# ---------- Stage 1: build ----------
# Chainguard `node:20-dev` (mirrored): node + npm + shell + apk. We need
# the `-dev` variant for the build stage because we have to RUN npm and
# shell commands. The `20-dev` tag comes from the dynamofl.com Chainguard
# org (paid catalog) so it's pinned to the Node 20 stream.
#
# Note: chainguard/node runs as a non-root user (uid 65532) by default.
# We switch to root only for the install step so npm has unconstrained
# write access to the workspace.
FROM ${BASE_REGISTRY}:chainguard-node-20-dev AS builder

USER root
WORKDIR /app

# Give Node enough heap for the Vite build of a large React app.
ENV NODE_OPTIONS=--max-old-space-size=4096

# Vite reads VITE_* from the build environment and inlines them into the
# bundle. Pass these via --build-arg at `docker build` time. They are NOT
# secrets (the anon key and Supabase URL are public), but they ARE
# per-environment.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_AGENT_API_URL

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_AGENT_API_URL=$VITE_AGENT_API_URL

COPY package.json package-lock.json ./
# Install ALL deps (including devDependencies like typescript & vite) so the
# build can run. Do NOT set NODE_ENV=production here - npm would silently
# skip devDependencies and `tsc` / `vite` would be missing.
RUN npm ci --no-audit --no-fund --include=dev

COPY . .

# Run `vite build` directly instead of `npm run build` (which is
# `tsc -b && vite build`). The TypeScript type-check should live in CI;
# gating image production on it would block deploys whenever any unrelated
# TS error exists. Output lands in /app/dist.
RUN NODE_ENV=production npx vite build

# ---------- Stage 2: runtime ----------
# Distroless nginx from Chainguard (mirrored).
# - No shell, no package manager, no curl/wget at runtime
# - Default user `nginx` (uid 65532) already configured
# - Default port 8080 (matches our config)
# - Healthchecks: handled by k8s liveness/readiness probes (run by kubelet,
#   not inside the container), so we don't need an in-container HEALTHCHECK
#   instruction (and couldn't run one anyway without a shell).
#
# NOTE on tag: `chainguard-nginx-latest` is a rolling mirror of
# cgr.dev/chainguard/nginx:latest because the dynamofl.com Chainguard org
# does not publish a pinned nginx tag today. Re-running the mirror script
# refreshes this tag - so for build reproducibility, re-mirror immediately
# before a release and don't re-mirror until the next release.
FROM ${BASE_REGISTRY}:chainguard-nginx-latest AS runtime

# Override the image's default config files. COPY --chown sets ownership at
# copy time since we cannot RUN chown in a distroless image.
COPY --chown=nginx:nginx deploy/nginx/nginx.conf       /etc/nginx/nginx.conf
COPY --chown=nginx:nginx deploy/nginx/default.conf     /etc/nginx/conf.d/default.conf

# Static assets, owned by the nginx user.
COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

# The Chainguard nginx image already sets:
#   USER nginx
#   ENTRYPOINT ["/usr/sbin/nginx"]
#   CMD ["-g", "daemon off;"]
# so no further USER/CMD/ENTRYPOINT directives are required.
