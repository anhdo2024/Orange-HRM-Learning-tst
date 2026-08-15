#!/usr/bin/env bash
set -euo pipefail

: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${RUNNER_TOKEN:?RUNNER_TOKEN is required}"
: "${RUNNER_NAME:?RUNNER_NAME is required}"
: "${RUNNER_LABELS:=docker-ephemeral}"

./config.sh \
  --unattended \
  --replace \
  --url "https://github.com/${GITHUB_REPOSITORY}" \
  --token "${RUNNER_TOKEN}" \
  --name "${RUNNER_NAME}" \
  --labels "${RUNNER_LABELS}" \
  --ephemeral \
  --disableupdate

cleanup() {
  ./config.sh remove --unattended --token "${RUNNER_TOKEN}" || true
}
trap cleanup EXIT
./run.sh

