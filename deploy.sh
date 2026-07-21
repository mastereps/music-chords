#!/usr/bin/env bash
#
# Deploys the currently checked-out branch on the VPS.
#
# Run it by hand (`./deploy.sh`) or let the GitHub Actions deploy job call it over SSH — both
# paths run these exact steps, so a manual deploy can never drift from an automated one.
#
# -e stops on the first failing command, so a rejected `git pull` or a failed migration never
# reaches the build and restart. That is the whole reason this is a script and not a one-liner.
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PM2_APP_NAME="${PM2_APP_NAME:-music-chords-api}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:5002/api/health}"

cd "$APP_DIR"

echo "==> Fetching latest code"
# --ff-only refuses to deploy when local commits or conflicts exist, instead of quietly merging.
git pull --ff-only

echo "==> Installing dependencies"
npm ci

# Uploaded resources live outside git, so the directory has to exist before the API boots.
mkdir -p backend/uploads/resources

echo "==> Applying database migrations"
npm run migrate

echo "==> Building"
npm run build

echo "==> Restarting $PM2_APP_NAME"
if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME" --update-env
else
  pm2 start backend/dist/index.js --name "$PM2_APP_NAME"
fi
pm2 save

echo "==> Waiting for health check at $HEALTH_URL"
for attempt in $(seq 1 10); do
  if curl --silent --fail --max-time 5 "$HEALTH_URL" >/dev/null; then
    echo "==> Deploy complete"
    exit 0
  fi

  echo "    not ready yet (attempt $attempt/10)"
  sleep 2
done

echo "!! Health check never passed. The new code is live but not responding." >&2
echo "!! Inspect with: pm2 logs $PM2_APP_NAME --lines 50" >&2
exit 1
