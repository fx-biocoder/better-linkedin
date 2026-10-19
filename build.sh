#!/bin/bash

# Extract version from manifest.json
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | head -1 | cut -d'"' -f4)

echo "Building Better LinkedIn v$VERSION..."
mkdir -p dist

# 1. Build Chrome version (Standard MV3)
echo "Packaging for Chrome..."
zip -qr dist/better_linkedin_chrome_v$VERSION.zip manifest.json *.js *.html img/ styles/ utils/ -x "*.DS_Store"

# 2. Build Firefox version (Adds background.scripts fallback)
echo "Packaging for Firefox..."
cp manifest.json manifest.original.json

# Inject the 'scripts' property for Firefox compatibility
python3 -c '
import json
with open("manifest.json", "r") as f:
    d = json.load(f)
d["background"]["scripts"] = ["background.js"]
with open("manifest.json", "w") as f:
    json.dump(d, f, indent=2)
'

zip -qr dist/better_linkedin_firefox_v$VERSION.zip manifest.json *.js *.html img/ styles/ utils/ -x "*.DS_Store"

# Restore original manifest
mv manifest.original.json manifest.json

echo "Build complete!"
echo "  dist/better_linkedin_chrome_v$VERSION.zip"
echo "  dist/better_linkedin_firefox_v$VERSION.zip"
