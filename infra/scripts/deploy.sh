#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════
# AEGIS — Full Deploy Script
#
# Usage:
#   ./infra/scripts/deploy.sh                 # Deploy all services
#   ./infra/scripts/deploy.sh api             # Deploy API only
#   ./infra/scripts/deploy.sh worker          # Deploy Worker only
#   ./infra/scripts/deploy.sh web             # Deploy Web only
#   ./infra/scripts/deploy.sh infra           # Terraform only (no images)
# ══════════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TF_DIR="${ROOT_DIR}/infra/terraform"

# Load project config from tfvars
if [ ! -f "${TF_DIR}/terraform.tfvars" ]; then
  echo "❌ Missing infra/terraform/terraform.tfvars"
  echo "   Copy terraform.tfvars.example → terraform.tfvars and fill in values."
  exit 1
fi

PROJECT_ID=$(grep 'project_id' "${TF_DIR}/terraform.tfvars" | head -1 | sed 's/.*= *"\(.*\)"/\1/')
REGION=$(grep 'region' "${TF_DIR}/terraform.tfvars" | head -1 | sed 's/.*= *"\(.*\)"/\1/')
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/aegis"
TARGET="${1:-all}"

echo "═══════════════════════════════════════"
echo "  AEGIS Deploy"
echo "  Project: ${PROJECT_ID}"
echo "  Region:  ${REGION}"
echo "  Target:  ${TARGET}"
echo "═══════════════════════════════════════"
echo

# ── Step 1: Terraform (infra) ──
if [[ "${TARGET}" == "all" || "${TARGET}" == "infra" ]]; then
  echo "▶ Running Terraform..."
  cd "${TF_DIR}"
  terraform init -input=false
  terraform apply -auto-approve
  cd "${ROOT_DIR}"
  echo "✅ Infrastructure provisioned"
  echo

  if [[ "${TARGET}" == "infra" ]]; then
    echo "Done (infra only). Set image URIs in terraform.tfvars and re-run."
    exit 0
  fi
fi

# ── Step 2: Authenticate Docker ──
echo "▶ Configuring Docker auth..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet
echo

# ── Helper: build & push ──
build_push() {
  local name="$1"
  local dockerfile="$2"
  local tag="${REGISTRY}/${name}:latest"

  echo "▶ Building ${name}..."
  docker build -f "${dockerfile}" -t "${tag}" "${ROOT_DIR}"
  echo "▶ Pushing ${name}..."
  docker push "${tag}"
  echo "✅ ${name} → ${tag}"
  echo
}

# ── Step 3: Build & push images ──
if [[ "${TARGET}" == "all" || "${TARGET}" == "api" ]]; then
  build_push "api" "infra/docker/api.Dockerfile"
fi

if [[ "${TARGET}" == "all" || "${TARGET}" == "worker" ]]; then
  build_push "worker" "infra/docker/worker.Dockerfile"
fi

if [[ "${TARGET}" == "all" || "${TARGET}" == "web" ]]; then
  if [ -d "${ROOT_DIR}/apps/web" ] && [ -f "${ROOT_DIR}/apps/web/package.json" ]; then
    build_push "web" "infra/docker/web.Dockerfile"
  else
    echo "⚠ apps/web not found — skipping web build"
    echo
  fi
fi

# ── Step 4: Deploy to Cloud Run via Terraform ──
echo "▶ Updating Cloud Run services via Terraform..."
cd "${TF_DIR}"

# Auto-update image URIs in a temp tfvars override
OVERRIDE=""
if [[ "${TARGET}" == "all" || "${TARGET}" == "api" ]]; then
  OVERRIDE="${OVERRIDE} -var=api_image=${REGISTRY}/api:latest"
fi
if [[ "${TARGET}" == "all" || "${TARGET}" == "worker" ]]; then
  OVERRIDE="${OVERRIDE} -var=worker_image=${REGISTRY}/worker:latest"
fi
if [[ "${TARGET}" == "all" || "${TARGET}" == "web" ]]; then
  if [ -d "${ROOT_DIR}/apps/web" ] && [ -f "${ROOT_DIR}/apps/web/package.json" ]; then
    OVERRIDE="${OVERRIDE} -var=web_image=${REGISTRY}/web:latest"
  fi
fi

terraform apply -auto-approve ${OVERRIDE}
cd "${ROOT_DIR}"

echo
echo "═══════════════════════════════════════"
echo "  ✅ Deploy complete!"
echo "═══════════════════════════════════════"
echo
cd "${TF_DIR}" && terraform output -json | python3 -c "
import json, sys
o = json.load(sys.stdin)
for k, v in o.items():
    if k.endswith('_url') and '(not deployed' not in str(v.get('value','')):
        print(f\"  {k}: {v['value']}\")
" 2>/dev/null || true
