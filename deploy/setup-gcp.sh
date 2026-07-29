#!/usr/bin/env bash
#
# One-time GCP setup for Sense Report Studio.
#
# Enables the required APIs, creates the Artifact Registry repository, and
# grants the Cloud Build service account the roles it needs to deploy to
# Cloud Run. Safe to re-run — every step is idempotent.
#
#   ./deploy/setup-gcp.sh
#
# Connecting the GitHub repository is a separate, interactive step; run
# ./deploy/setup-trigger.sh afterwards.

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-portal-503823}"
REGION="${REGION:-us-central1}"
REPO="${REPO:-apps}"

say() { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }

say "Project: ${PROJECT_ID} · region: ${REGION}"
gcloud config set project "${PROJECT_ID}" >/dev/null

PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')"
echo "Project number: ${PROJECT_NUMBER}"

say "Enabling APIs"
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com \
  cloudresourcemanager.googleapis.com \
  --project "${PROJECT_ID}"

say "Creating Artifact Registry repository '${REPO}'"
if gcloud artifacts repositories describe "${REPO}" \
     --location "${REGION}" --project "${PROJECT_ID}" >/dev/null 2>&1; then
  echo "Already exists — skipping."
else
  gcloud artifacts repositories create "${REPO}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="Container images for Innova apps" \
    --project "${PROJECT_ID}"
fi

say "Granting deploy permissions to the Cloud Build service account"
# Cloud Build runs as the legacy <project-number>@cloudbuild SA unless a
# trigger names its own. Both identities are granted so either path works.
CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# roles/cloudbuild.builds.builder is the bundle the compute SA needs since
# Google made it the default build identity: it carries the source-bucket read
# that `gcloud builds submit` depends on, plus logging and registry access.
for SA in "${CLOUDBUILD_SA}" "${COMPUTE_SA}"; do
  for ROLE in roles/cloudbuild.builds.builder roles/run.admin roles/iam.serviceAccountUser \
              roles/artifactregistry.writer roles/logging.logWriter roles/storage.objectViewer; do
    gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
      --member="serviceAccount:${SA}" \
      --role="${ROLE}" \
      --condition=None \
      --quiet >/dev/null
  done
  echo "Granted builds.builder, run.admin, serviceAccountUser, artifactregistry.writer, logging.logWriter, storage.objectViewer to ${SA}"
done

say "Done"
cat <<EOF
Next steps:
  1. Deploy once by hand to verify the pipeline:
       ./deploy/deploy.sh
  2. Wire up automatic deploys on push:
       ./deploy/setup-trigger.sh
EOF
