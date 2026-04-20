#!/bin/sh
# TCRB Agent — Container entrypoint
# Boots the cloned repo, configures git, then launches the Node server

set -e

REPO_OWNER="${REPO_OWNER:-Xyphrius}"
REPO_NAME="${REPO_NAME:-tcrb-site}"
REPO_DIR="/data/tcrb-site"
OUTPUT_DIR="/data/output"

echo "═══ TCRB AGENT BOOT ═══"
echo "Repo: ${REPO_OWNER}/${REPO_NAME}"
echo "Site path: ${REPO_DIR}"
echo "Output path: ${OUTPUT_DIR}"

# Validate required env
if [ -z "$GITHUB_TOKEN" ]; then
  echo "ERROR: GITHUB_TOKEN secret not set. Run: fly secrets set GITHUB_TOKEN=<pat>"
  exit 1
fi

# Ensure persistent output dirs exist
mkdir -p "${OUTPUT_DIR}/pending"
mkdir -p "${OUTPUT_DIR}/approved"
mkdir -p "${OUTPUT_DIR}/fundraising"
mkdir -p "${OUTPUT_DIR}/merch"
mkdir -p "${OUTPUT_DIR}/signups"

# Initialize empty queue files if missing
[ ! -f "${OUTPUT_DIR}/pending/review-queue.json" ] && echo '{"items":[],"lastUpdated":null}' > "${OUTPUT_DIR}/pending/review-queue.json"
[ ! -f "${OUTPUT_DIR}/signups/queue.json" ] && echo '[]' > "${OUTPUT_DIR}/signups/queue.json"
[ ! -f "${OUTPUT_DIR}/signups/members.json" ] && echo '[]' > "${OUTPUT_DIR}/signups/members.json"

# Configure git identity
git config --global user.name "TCRB Agent"
git config --global user.email "agent@tcrb.io"
git config --global pull.rebase false
git config --global init.defaultBranch main

REMOTE_URL="https://${GITHUB_TOKEN}@github.com/${REPO_OWNER}/${REPO_NAME}.git"

if [ ! -d "${REPO_DIR}/.git" ]; then
  echo "Cloning ${REPO_OWNER}/${REPO_NAME}..."
  git clone "${REMOTE_URL}" "${REPO_DIR}"
else
  echo "Pulling latest from ${REPO_OWNER}/${REPO_NAME}..."
  cd "${REPO_DIR}"
  git remote set-url origin "${REMOTE_URL}"
  git fetch origin main
  git reset --hard origin/main
  cd /app
fi

echo "Repo ready at ${REPO_DIR}"
echo "Starting TCRB Agent server on port ${PORT:-8080}..."
echo "═══════════════════════"

# Hand off to the Node process (PID 1 for proper signal handling)
exec node /app/server.js
