#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-aegis-mvp}"
REGION="${GCP_REGION:-us-central1}"
SERVICE="aegis-api"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE}"

echo "Building image..."
docker build -f infra/docker/api.Dockerfile -t "${IMAGE}" .

echo "Pushing image..."
docker push "${IMAGE}"

echo "Deploying to Cloud Run..."
gcloud run deploy "${SERVICE}" \
  --image "${IMAGE}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --set-env-vars "PYTHONPATH=/app/src:/app"

echo "Deploy complete."
gcloud run services describe "${SERVICE}" --region "${REGION}" --format 'value(status.url)'
