#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f /runner/config.sh ]]; then
  echo "Installing the GitHub Actions runner files into the persistent volume."
  cp -a /opt/actions-runner/. /runner/
fi
chown -R runner:runner /runner

if [[ ! -f /runner/.runner ]]; then
  echo "GitHub Actions runner is not configured."
  echo "Configure it once with ./config.sh, then restart the container."
  exec tail -f /dev/null
fi

if [[ ! -x /runner/run.sh ]]; then
  echo "GitHub Actions runner executable was not found at /runner/run.sh."
  exit 1
fi

echo "Starting GitHub Actions runner: $(grep -o '"agentName"[^,]*' /runner/.runner 2>/dev/null || echo configured)"
exec su -s /bin/bash runner -c /runner/run.sh
