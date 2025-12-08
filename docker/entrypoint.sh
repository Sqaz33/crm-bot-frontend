#!/bin/sh
set -e

# Render runtime config from environment into a JS file consumed by the SPA
if [ -f /usr/share/nginx/html/runtime-config.template.js ]; then
  envsubst < /usr/share/nginx/html/runtime-config.template.js > /usr/share/nginx/html/runtime-config.js
fi

exec "$@"
