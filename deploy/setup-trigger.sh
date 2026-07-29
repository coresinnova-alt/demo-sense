#!/usr/bin/env bash
#
# Creates the Cloud Build trigger that redeploys on every push to main.
#
#   ./deploy/setup-trigger.sh
#
# Requires the GitHub repository to be connected to Cloud Build first. That
# step is an OAuth handshake and has to happen in a browser once per GitHub
# account — this script detects whether it is done and tells you where to go.

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-portal-503823}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-sense-report-studio}"
REPO="${REPO:-apps}"
GITHUB_OWNER="${GITHUB_OWNER:-coresinnova-alt}"
GITHUB_REPO="${GITHUB_REPO:-demo-sense}"
BRANCH="${BRANCH:-^main$}"
TRIGGER_NAME="${TRIGGER_NAME:-sense-report-studio-main}"

say() { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }

say "Checking for an existing trigger"
for LOC in "${REGION}" global; do
  if gcloud builds triggers describe "${TRIGGER_NAME}" \
       --region="${LOC}" --project "${PROJECT_ID}" >/dev/null 2>&1; then
    echo "Trigger '${TRIGGER_NAME}' already exists in ${LOC} — nothing to do."
    exit 0
  fi
done

# A 1st-gen GitHub App connection registers the repo globally, while a 2nd-gen
# connection is regional. Which one the console created is not knowable up
# front, so both locations are attempted.
say "Creating push-to-${BRANCH} trigger for ${GITHUB_OWNER}/${GITHUB_REPO}"
CREATED=""
for LOC in "${REGION}" global; do
  echo "  trying location: ${LOC}"
  if gcloud builds triggers create github \
    --name="${TRIGGER_NAME}" \
    --region="${LOC}" \
    --project="${PROJECT_ID}" \
    --repo-owner="${GITHUB_OWNER}" \
    --repo-name="${GITHUB_REPO}" \
    --branch-pattern="${BRANCH}" \
    --build-config="cloudbuild.yaml" \
    --substitutions="_SERVICE=${SERVICE},_REGION=${REGION},_REPO=${REPO},_TAG=\$SHORT_SHA" \
    --description="Build and deploy Sense Report Studio to Cloud Run on push to main" 2>/dev/null
  then
    CREATED="${LOC}"
    break
  fi
done

if [[ -n "${CREATED}" ]]; then
  say "Trigger created in ${CREATED}"
  echo "Every push to main now builds and deploys automatically."
else
  cat <<EOF

✗ Could not create the trigger. Almost always this means the GitHub
  repository is not connected to Cloud Build yet.

  Connect it once (browser, ~1 minute):

    https://console.cloud.google.com/cloud-build/triggers/connect?project=${PROJECT_ID}

  Choose "GitHub (Cloud Build GitHub App)", authorise the
  ${GITHUB_OWNER} account, tick ${GITHUB_REPO}, then re-run this script.

EOF
  exit 1
fi
