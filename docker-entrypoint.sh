#!/bin/sh
set -e

# Replace __VITE_API_URL__ in built files with runtime VITE_API_URL if provided
if [ -n "$VITE_API_URL" ]; then
  # Escape forward slashes and ampersands for use in sed replacement
  ESCAPED=$(printf '%s' "$VITE_API_URL" | sed -e 's/[\/&]/\\&/g')

  # Replace in .js and .html files
  find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" \) -print0 |
    while IFS= read -r -d '' F; do
      sed -i "s|__VITE_API_URL__|$ESCAPED|g" "$F"
    done
fi

exec "$@"
