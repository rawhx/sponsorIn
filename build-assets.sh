#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

UID_VAL=$(id -u)
GID_VAL=$(id -g)

docker run --rm \
  --user "$UID_VAL:$GID_VAL" \
  -v "$PWD":/app \
  -w /app \
  -e HOME=/tmp \
  -e npm_config_cache=/tmp/.npm \
  -e VITE_APP_NAME=SponsorIn \
  node:24-bookworm-slim \
  sh -c "[ -d node_modules ] || npm ci; npm run build"

echo "Build selesai. Asset ada di public/build/"
