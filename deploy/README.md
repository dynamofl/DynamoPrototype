# DynamoPrototype - EKS UAT deployment

This folder contains everything needed to ship DynamoPrototype to an
existing EKS cluster as a single Helm release.

```
deploy/
├── README.md                    <- you are here
├── nginx/                       <- nginx config baked into the frontend image
│   ├── nginx.conf
│   └── default.conf
└── helm/
    └── dynamoprototype/         <- the Helm chart
        ├── Chart.yaml
        ├── values.yaml          <- chart defaults
        ├── env/                 <- per-environment override files
        │   └── dynamoai-aws-uat-default.yaml
        └── templates/
```

The two container images live in the repo root:

- `Dockerfile` (frontend, Vite + Chainguard nginx distroless) at `DynamoPrototype/Dockerfile`
- `agent-api/Dockerfile` (FastAPI + uvicorn on Chainguard wolfi-base + python-3.12)

Both Dockerfiles `FROM` images mirrored into our private ECR repo
`058264092984.dkr.ecr.us-east-1.amazonaws.com/dynamoai-base`. The mirror
is populated by `chainguard-poc/push-dynamoprototype-bases-to-ecr.sh` -
re-run that script (or the equivalent CI job) before any release that
needs to refresh the base layers.

| Dockerfile stage | ECR tag | Mirrored from |
| --- | --- | --- |
| Frontend builder | `dynamoai-base:chainguard-node-20-dev` | `cgr.dev/dynamofl.com/node:20-dev` (pinned) |
| Frontend runtime | `dynamoai-base:chainguard-nginx-latest` | `cgr.dev/chainguard/nginx:latest` (rolling) |
| Agent-API base | `dynamoai-base:chainguard-wolfi-base-latest` | `cgr.dev/chainguard/wolfi-base:latest` (rolling) |

The runtime nginx is **distroless** (no shell, no package manager); the
agent-api uses wolfi-base + `apk add python-3.12` so you can
`kubectl exec -it ... sh` to debug FastAPI behaviour.

Each `FROM` is parameterised by an `ARG BASE_REGISTRY` so CI can override
the registry for local builds, dev clusters or air-gapped accounts:

```bash
docker build \
  --build-arg BASE_REGISTRY=my-other-registry.example.com/dynamoai-base \
  ...
```

Why wolfi-base for the agent-api instead of `chainguard/python:latest-dev`?
The python image's rolling tag currently ships Python 3.14 and our pinned
`pydantic-core` doesn't yet publish 3.14 wheels (pip would fall back to a
Rust source build). Pinning to `python-3.12` via wolfi sidesteps this and
keeps every image in the Chainguard hardening boundary.

If you have a Chainguard **Production** subscription you can swap the
rolling tags for pinned ones (e.g. `nginx:1.27`, `python:3.12-dev`,
`node:20-dev`) - the comments at the top of each Dockerfile mark the
exact lines to change.

Final image sizes (linux/arm64, locally built):

| Image | Size |
| --- | --- |
| `dynamoprototype-frontend:local` | ~21 MB |
| `dynamoprototype-agent-api:local` | ~150 MB |

Runtime hardening enabled by default in `values.yaml`:

- `runAsNonRoot: true`, `runAsUser: 65532` (Chainguard's standard nonroot uid)
- `readOnlyRootFilesystem: true` for the frontend (uses a tmpfs at `/tmp`
  for nginx pid + temp files - configured in `deploy/nginx/nginx.conf`)
- `capabilities: drop: [ALL]`, `allowPrivilegeEscalation: false`,
  `seccompProfile: RuntimeDefault`

> **About RDS:** the original ask was "deploy on EKS with RDS as the
> database". The app's data layer is **managed Supabase Cloud**
> (Postgres + auth + edge functions + realtime + vault + storage) used
> by both the React app and the `agent-api` MCP tool. Until/unless we
> migrate off Supabase, **RDS is not used**. If you later self-host
> Supabase or rewrite the backend onto raw Postgres, that's where RDS
> would fit; it is intentionally out of scope here.

---

## Architecture

```
                                  443 / HTTPS
  user --->  AWS ALB  ---------------------------+
              (one ALB shared via group.name)    |
                  |                              |
        path: /agent                       path: /
                  v                              v
        +-----------------+              +-----------------+
        |  agent-api Svc  |              |  frontend Svc   |
        |  (uvicorn 8000) |              |  (nginx 8080)   |
        +-----------------+              +-----------------+
                  |                              |
                  +-------------+----------------+
                                |
                          managed Supabase Cloud
                                |
                          (frontend hits Supabase
                           directly from browser too)
```

Both pods reach `*.supabase.co`, `mcp.supabase.com`, and
`api.openai.com` via cluster egress.

---

## Preflight checks (one-time per cluster)

The chart **assumes** the following already exists in the UAT cluster /
account. It does **not** install them:

1. **AWS Load Balancer Controller** running in the cluster (creates
   the ALB from the `Ingress` object).
   ```bash
   kubectl get deploy -n kube-system aws-load-balancer-controller
   ```
2. **ACM certificate** in the same region as the cluster, covering the
   UAT hostname you'll use. Note its ARN.
3. **ECR repositories** in the UAT account / region for OUR images:
   ```bash
   aws ecr create-repository --repository-name dynamoprototype-frontend
   aws ecr create-repository --repository-name dynamoprototype-agent-api
   ```
4. **Chainguard base-image access** from your build host (CI/dev laptop):
   ```bash
   # one-time per host
   docker login cgr.dev -u <chainguard-user> -p <chainguard-token>
   ```
   You also need a strategy for the EKS nodes to resolve `cgr.dev/...`
   FROM lines if you ever push images that still reference the
   Chainguard registry directly. See "Pulling Chainguard images from
   EKS" below.
5. **Node IAM role** can pull from ECR (managed-policy
   `AmazonEC2ContainerRegistryReadOnly` on the node role, or IRSA on
   the pods' ServiceAccount).
6. **Outbound egress** from pods to the public internet (Supabase +
   OpenAI). NAT gateway in private subnets, or public subnets.
7. **DNS**: a Route53 record (CNAME or A/ALIAS) for the UAT hostname
   pointing at the ALB. The ALB Controller can create one if you
   install ExternalDNS, otherwise create it manually after the first
   `helm install`.

### Pulling Chainguard images from EKS

The container images we build embed `cgr.dev/chainguard/nginx:1.27`
and `cgr.dev/chainguard/python:3.12-dev` as their base layers. Once
**we** build and push the resulting image to ECR, the EKS nodes pull
the FULLY-MATERIALISED image from ECR - they do NOT need to talk to
`cgr.dev` themselves. The recommended setup is therefore:

| Concern | Where Chainguard credentials are needed |
| --- | --- |
| `docker build` (CI / laptop) | YES - the build host pulls the base layer from `cgr.dev` |
| `docker push` to ECR | NO - ECR-only |
| EKS node `imagePull` | NO - pulls our image from ECR, which already contains the embedded layers |

If you instead want EKS to pull `cgr.dev/...` images directly (e.g. you
deploy unmodified third-party Chainguard images), set up an **ECR
pull-through cache** for `cgr.dev`:
```bash
aws ecr create-pull-through-cache-rule \
  --ecr-repository-prefix chainguard \
  --upstream-registry-url cgr.dev \
  --credential-arn <secrets-manager-arn-with-cgr-creds>
```
Then reference images as
`<account>.dkr.ecr.<region>.amazonaws.com/chainguard/<image>:<tag>`.

---

## Build images

Replace placeholders:

- `<region>` e.g. `us-east-1`
- `<account>` e.g. `123456789012`
- `<sha>` short git SHA, e.g. `$(git rev-parse --short HEAD)`
- `<host>` your UAT hostname, e.g. `dynamoprototype-uat.example.com`

From the **`DynamoPrototype/`** directory:

```bash
# Login once per shell
aws ecr get-login-password --region <region> \
  | docker login --username AWS --password-stdin \
      <account>.dkr.ecr.<region>.amazonaws.com

REG=<account>.dkr.ecr.<region>.amazonaws.com
TAG=uat-$(git rev-parse --short HEAD)

# --- Frontend (Vite + nginx) ---
# Vite bakes VITE_* into the bundle at build time, so per-env values
# must be passed as --build-arg. The Supabase anon key is *public*
# (not a secret) - it's safe to bake in.
docker build \
  -t $REG/dynamoprototype-frontend:$TAG \
  --build-arg VITE_SUPABASE_URL=https://<your-project>.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=<your-anon-key> \
  --build-arg VITE_AGENT_API_URL=https://<host>/agent \
  -f Dockerfile .

# --- Agent API (FastAPI) ---
docker build \
  -t $REG/dynamoprototype-agent-api:$TAG \
  -f agent-api/Dockerfile agent-api/

# Push both
docker push $REG/dynamoprototype-frontend:$TAG
docker push $REG/dynamoprototype-agent-api:$TAG
```

---

## Create the runtime Secret (one-time per env)

The chart defaults to `secrets.useExisting=true` and looks for a
Secret named `app-secrets` in the release namespace.

```bash
kubectl create namespace dynamoprototype-uat

kubectl -n dynamoprototype-uat create secret generic app-secrets \
  --from-literal=OPENAI_API_KEY='sk-...' \
  --from-literal=SUPABASE_SERVICE_ROLE_KEY='eyJ...' \
  --from-literal=SUPABASE_MCP_TOKEN='sbp_...'
```

To rotate, re-run with `--dry-run=client -o yaml | kubectl apply -f -`.

> Alternative: if you'd rather have Helm own the Secret, set
> `secrets.useExisting=false` and pass the values via a private
> `secrets-uat.yaml` (gitignored) or `--set secrets.data.*=...`. The
> chart will then render a Secret called
> `dynamoprototype-secrets`.

---

## Edit the env values file

Replace the four `REPLACE_ME` placeholders in
`deploy/helm/dynamoprototype/env/dynamoai-aws-uat-default.yaml`:

| Field | Example |
| --- | --- |
| `image.registry` | `123456789012.dkr.ecr.us-east-1.amazonaws.com` |
| `agentApi.corsAllowOrigins` | `https://dynamoprototype-uat.example.com` |
| `ingress.host` | `dynamoprototype-uat.example.com` |
| `ingress.certificateArn` | `arn:aws:acm:us-east-1:123456789012:certificate/...` |

If you want the ALB reachable from the public internet, also set
`ingress.scheme: internet-facing` (default is `internal`).

---

## Deploy

```bash
TAG=uat-$(git rev-parse --short HEAD)

helm upgrade --install dynamoprototype \
  deploy/helm/dynamoprototype \
  --namespace dynamoprototype-uat --create-namespace \
  -f deploy/helm/dynamoprototype/env/dynamoai-aws-uat-default.yaml \
  --set image.tag=$TAG \
  --wait --timeout 5m
```

Verify:

```bash
kubectl -n dynamoprototype-uat get pods,svc,ingress
kubectl -n dynamoprototype-uat logs deploy/dynamoprototype-agent-api --tail=50
```

The ALB takes ~2-3 minutes to provision the first time. Once the
Ingress shows an `ADDRESS`, hit:

```bash
curl -fsS https://<host>/healthz           # frontend nginx
curl -fsS https://<host>/agent/health      # agent-api FastAPI
```

---

## Rollback

```bash
# List release history
helm -n dynamoprototype-uat history dynamoprototype

# Roll back to the previous revision
helm -n dynamoprototype-uat rollback dynamoprototype 0   # 0 = previous

# Or roll back to a specific revision number
helm -n dynamoprototype-uat rollback dynamoprototype 4
```

---

## Uninstall

```bash
helm -n dynamoprototype-uat uninstall dynamoprototype
kubectl delete namespace dynamoprototype-uat   # also removes app-secrets
```

The ALB is destroyed automatically when the Ingress object is
deleted (give the ALB Controller ~1 minute).

---

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| `Ingress` has no `ADDRESS` after 5 min | `aws-load-balancer-controller` not running, or the cluster's IAM lacks ALB perms. Check controller logs in `kube-system`. |
| ALB returns 503 | Targets are unhealthy. Check `alb.ingress.kubernetes.io/healthcheck-path` (default `/healthz`) and that pods are `Ready`. |
| Frontend loads but Supabase calls fail with 401 | `VITE_SUPABASE_*` build args were wrong - rebuild & redeploy a new image tag. |
| `agent-api` 500s with "OPENAI_API_KEY environment variable is required" | The Secret either doesn't exist or doesn't contain that key. `kubectl -n dynamoprototype-uat get secret app-secrets -o jsonpath='{.data}' | base64 -d` (after JSON-parsing). |
| Frontend chat composer hits localhost | The image was built without `VITE_AGENT_API_URL`. Rebuild with the build arg. |
| CORS preflight fails | `agentApi.corsAllowOrigins` doesn't include the exact frontend origin (scheme + host, no trailing slash). |

---

## Out of scope (deliberately)

- RDS / self-hosted Supabase (see top note)
- HPA, PodDisruptionBudget, NetworkPolicy
- ServiceMonitor / Prometheus scraping
- CI pipelines (build & push are documented but not automated)
- `scripts/` backfill jobs as `CronJob`s
- External Secrets Operator integration with AWS Secrets Manager
  (the `templates/secret.yaml` would be replaced with an
  `ExternalSecret` when you're ready)
