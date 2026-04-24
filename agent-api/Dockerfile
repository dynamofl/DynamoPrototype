# syntax=docker/dockerfile:1.7

# Base image is mirrored from Chainguard into our private ECR repo
# (`dynamoai-base`) by chainguard-poc/push-dynamoprototype-bases-to-ecr.sh.
# This keeps build/runtime pulls inside our AWS account and removes any
# dependency on cgr.dev pull credentials at build / deploy time.
ARG BASE_REGISTRY=058264092984.dkr.ecr.us-east-1.amazonaws.com/dynamoai-base

# ---------- Stage 1: build (install deps into a venv) ----------
# Why wolfi-base instead of the chainguard/python image:
# `chainguard/python:latest-dev` currently ships Python 3.14 (rolling tag),
# and several of our pinned deps (notably pydantic-core 2.x) don't yet
# publish wheels for 3.14, so pip falls back to a Rust source build that
# blows up. By starting from wolfi-base and installing `python-3.12`
# explicitly we get a deterministic Python version while keeping all the
# Chainguard hardening guarantees of Wolfi.
#
# Tag note: `chainguard-wolfi-base-latest` is a rolling mirror of
# cgr.dev/chainguard/wolfi-base:latest because the dynamofl.com Chainguard
# org does not publish a pinned wolfi-base tag today. Re-run the mirror
# script to refresh; immediately before a release for reproducibility.
FROM ${BASE_REGISTRY}:chainguard-wolfi-base-latest AS builder

USER root
WORKDIR /app

RUN apk add --no-cache python-3.12 py3.12-pip

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    VIRTUAL_ENV=/opt/venv \
    PATH=/opt/venv/bin:$PATH

RUN python3.12 -m venv "$VIRTUAL_ENV"

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# ---------- Stage 2: runtime ----------
# Per the deployment plan, we keep the wolfi-base style runtime (rather
# than swapping to a distroless image) so the operator can
# `kubectl exec -it ... sh` into the pod for debugging. wolfi-base ships
# a shell + apk while still being non-root by default
# (`nonroot` user, uid 65532).
FROM ${BASE_REGISTRY}:chainguard-wolfi-base-latest AS runtime

USER root
RUN apk add --no-cache python-3.12 curl

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/opt/venv \
    PATH=/opt/venv/bin:$PATH

# Copy the prebuilt venv and the app source. --chown ensures the nonroot
# runtime user can read everything without extra RUN chown calls.
COPY --from=builder --chown=nonroot:nonroot /opt/venv /opt/venv
COPY --chown=nonroot:nonroot main.py ./

USER nonroot

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8000/health || exit 1

# uvicorn honours --root-path so FastAPI generates correct OpenAPI URLs
# when the app is mounted under a path prefix by the ingress (e.g. /agent).
# Set ROOT_PATH="" for local/dev (no prefix).
CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port 8000 --root-path \"${ROOT_PATH:-}\""]
