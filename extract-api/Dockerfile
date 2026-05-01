# syntax=docker/dockerfile:1.7

# Base image is mirrored from Chainguard into our private ECR repo
# (`dynamoai-base`) by chainguard-poc/push-dynamoprototype-bases-to-ecr.sh.
# Same pattern as agent-api/Dockerfile so build/runtime pulls stay
# inside our AWS account.
ARG BASE_REGISTRY=058264092984.dkr.ecr.us-east-1.amazonaws.com/dynamoai-base

# ---------- Stage 1: build (install deps into a venv) ----------
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
# Same wolfi-base style runtime as agent-api so operators can
# `kubectl exec -it ... sh` for debugging. Non-root by default
# (`nonroot` user, uid 65532).
FROM ${BASE_REGISTRY}:chainguard-wolfi-base-latest AS runtime

USER root
RUN apk add --no-cache python-3.12 curl

WORKDIR /app

# OMP_NUM_THREADS / MKL_NUM_THREADS keep a single pod from saturating its
# node when MarkItDown's underlying parsers (e.g. pdfminer.six, openpyxl)
# spin up internal worker threads. Tune up if pod resources allow.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/opt/venv \
    PATH=/opt/venv/bin:$PATH \
    OMP_NUM_THREADS=2 \
    MKL_NUM_THREADS=2

COPY --from=builder --chown=nonroot:nonroot /opt/venv /opt/venv
COPY --chown=nonroot:nonroot main.py ./

USER nonroot

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8001/health || exit 1

# uvicorn honours --root-path so FastAPI generates correct OpenAPI URLs
# when the app is mounted under a path prefix by the ingress (e.g. /extract).
# Set ROOT_PATH="" for local/dev (no prefix).
CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port 8001 --root-path \"${ROOT_PATH:-}\""]
