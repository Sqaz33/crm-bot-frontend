#!/bin/sh
set -e

# Render runtime config from environment into a JS file served by Vite dev server.
if [ -f /app/public/runtime-config.template.js ]; then
  envsubst < /app/public/runtime-config.template.js > /app/public/runtime-config.js
fi

exec "$@"
