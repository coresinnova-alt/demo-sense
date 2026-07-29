#!/usr/bin/env bash
#
# Manual deploy: submits the working tree to Cloud Build, which builds the
# image, pushes it to Artifact Registry and rolls out a new Cloud Run revision.
#
#   ./deploy/deploy.sh

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-portal-503823}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-demo-sense}"
REPO="${REPO:-apps}"

# Tag with the current commit when the tree is clean, so a deployed revision
# is always traceable back to a commit.
if git diff --quiet && git diff --cached --quiet 2>/dev/null; then
  TAG="$(git rev-parse --short HEAD 2>/dev/null || echo manual)"
else
  TAG="dirty-$(date +%Y%m%d-%H%M%S)"
  echo "⚠ Working tree has uncommitted changes — tagging image as ${TAG}"
fi

cd "$(dirname "$0")/.."

echo "▸ Submitting build to Cloud Build (${PROJECT_ID} · ${REGION} · tag ${TAG})"
gcloud builds submit \
  --config cloudbuild.yaml \
  --project "${PROJECT_ID}" \
  --substitutions "_SERVICE=${SERVICE},_REGION=${REGION},_REPO=${REPO},_TAG=${TAG}"

URL="$(gcloud run services describe "${SERVICE}" \
  --region "${REGION}" --project "${PROJECT_ID}" --format='value(status.url)')"

echo
echo "▸ Deployed: ${URL}"
